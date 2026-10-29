import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';

import { ConfigService, InjectModel, LoggingService } from '@douglasneuroinformatics/libnest';
import type { Model } from '@douglasneuroinformatics/libnest';
import {
  BadGatewayException,
  BadRequestException,
  ConflictException,
  HttpException,
  Injectable,
  NotFoundException
} from '@nestjs/common';
import type { OnModuleInit } from '@nestjs/common';
import { bundle, BUNDLER_FILE_EXT_REGEX, inferLoader } from '@opendatacapture/instrument-bundler';
import type { BundlerInput } from '@opendatacapture/instrument-bundler';
import { $CreateInstrumentRepoData } from '@opendatacapture/schemas/instrument-repo';
import type {
  InstrumentRepoSyncAction,
  InstrumentRepoSyncFailure,
  InstrumentRepoSyncStage
} from '@opendatacapture/schemas/instrument-repo';
import JSZip from 'jszip';
import { z } from 'zod/v4';

import { accessibleQuery } from '@/auth/ability.utils';
import { decryptSecret, encryptSecret } from '@/core/secret-cipher';
import type { EntityOperationOptions } from '@/core/types';
import { InstrumentsService } from '@/instruments/instruments.service';

type InstrumentImportResult =
  | { created: boolean; id: string; kind: 'imported' }
  | { kind: 'failed'; message: string; stage: InstrumentRepoSyncStage }
  | { kind: 'skipped' };

type RepoImportResult = { createdIds: string[]; failures: InstrumentRepoSyncFailure[]; instrumentIds: string[] };

type InstrumentRepoRecord = Awaited<ReturnType<Model<'InstrumentRepo'>['findFirstOrThrow']>>;

/**
 * The newest entries one request returns. The collection is append-only and nothing prunes it, so an
 * unbounded read grows with the instance's whole history.
 */
const SYNC_LOG_LIMIT = 500;

/**
 * The detail Nest exceptions thrown by `InstrumentsService.create` carry beyond their message: a VM
 * evaluation error as `cause`, schema validation errors as `issues`.
 */
const $ExceptionDetails = z.object({
  cause: z.object({ message: z.string() }).optional(),
  issues: z.array(z.object({ message: z.string(), path: z.array(z.union([z.string(), z.number()])) })).optional()
});

function describeImportError(error: unknown): string {
  if (!(error instanceof Error)) {
    return String(error);
  }
  const details = $ExceptionDetails.safeParse(error instanceof HttpException ? error.getResponse() : undefined);
  if (!details.success) {
    return error.message;
  }
  const reasons = [
    details.data.cause?.message,
    ...(details.data.issues ?? []).map(({ message, path }) => (path.length ? `${path.join('.')}: ${message}` : message))
  ].filter((reason) => reason !== undefined);
  return [error.message, ...reasons].join(' - ');
}

@Injectable()
export class InstrumentReposService implements OnModuleInit {
  constructor(
    @InjectModel('Group') private readonly groupModel: Model<'Group'>,
    @InjectModel('InstrumentRepo') private readonly instrumentRepoModel: Model<'InstrumentRepo'>,
    @InjectModel('InstrumentRepoSyncLog') private readonly instrumentRepoSyncLogModel: Model<'InstrumentRepoSyncLog'>,
    @InjectModel('Instrument') private readonly instrumentModel: Model<'Instrument'>,
    private readonly configService: ConfigService,
    private readonly instrumentsService: InstrumentsService,
    private readonly loggingService: LoggingService
  ) {}

  async create({ accessToken, url }: $CreateInstrumentRepoData) {
    const { owner, repoName } = this.parseGitHubUrl(url);
    const normalizedUrl = this.normalizeUrl(url);

    // Re-adding an already-registered repo is treated as a re-sync rather than an error. If a new
    // access token was supplied (e.g. the previous one expired), persist it first so the sync — and
    // all future syncs — use the updated credentials.
    const existing = await this.instrumentRepoModel.findFirst({ where: { url: normalizedUrl } });
    if (existing) {
      if (accessToken) {
        await this.instrumentRepoModel.update({
          data: { accessToken: this.encrypt(accessToken) },
          where: { id: existing.id }
        });
      }
      const result = await this.syncRepo(existing);
      if (!result.ok) {
        throw result.error;
      }
      return this.stripSecrets(result.repo);
    }

    let result: RepoImportResult;
    try {
      result = await this.importInstruments(owner, repoName, accessToken);
    } catch (err) {
      await this.recordSync({ action: 'IMPORT', error: err, repoId: null, repoName });
      throw err;
    }
    const { createdIds, failures, instrumentIds } = result;

    const repo = await this.instrumentRepoModel.create({
      data: {
        accessToken: accessToken ? this.encrypt(accessToken) : null,
        instrumentIds,
        lastSyncedAt: new Date(),
        name: repoName,
        owner,
        repoName,
        url: normalizedUrl
      }
    });

    // Attribute provenance only to instruments this import actually created. Instruments that
    // already existed (e.g. added manually) keep their original provenance.
    await this.tagInstruments(createdIds, repo.id, repo.name);
    await this.recordSync({
      action: 'IMPORT',
      failures,
      importedCount: instrumentIds.length,
      repoId: repo.id,
      repoName
    });
    // Re-adopt any pre-existing instruments orphaned by a previously-deleted copy of this repo.
    await this.reconcileOrphanedInstruments();

    return this.stripSecrets(repo);
  }

  async deleteById(id: string, { ability }: EntityOperationOptions = {}) {
    const repo = await this.instrumentRepoModel.findFirst({
      where: { AND: [accessibleQuery(ability, 'delete', 'InstrumentRepo')], id }
    });
    if (!repo) {
      throw new NotFoundException(`Failed to find instrument repo with ID: ${id}`);
    }
    // Query live groups rather than relying on repo.groupIds, which can hold stale references
    // to groups that have since been deleted.
    const groupsUsingRepo = await this.groupModel.count({
      where: { instrumentRepoIds: { has: id } }
    });
    if (groupsUsingRepo > 0) {
      throw new ConflictException(
        'Cannot delete this repository because it is currently assigned to one or more groups. Remove it from all groups first.'
      );
    }
    const deleted = await this.instrumentRepoModel.delete({ where: { id } });
    // Any instrument a group had selected from this repo becomes a manually-uploaded instrument so it
    // persists; the rest stay hidden as orphans.
    await this.reconcileOrphanedInstruments();
    return this.stripSecrets(deleted);
  }

  /** Erase the whole activity log. The repositories and their instruments are untouched. */
  async deleteSyncLogs({ ability }: EntityOperationOptions = {}) {
    return this.instrumentRepoSyncLogModel.deleteMany({
      where: accessibleQuery(ability, 'delete', 'InstrumentRepoSyncLog')
    });
  }

  async findAll({ ability }: EntityOperationOptions = {}) {
    const repos = await this.instrumentRepoModel.findMany({
      where: accessibleQuery(ability, 'read', 'InstrumentRepo')
    });
    return repos.map((repo) => this.stripSecrets(repo));
  }

  async findSyncLogs({ ability }: EntityOperationOptions = {}) {
    return this.instrumentRepoSyncLogModel.findMany({
      orderBy: { createdAt: 'desc' },
      take: SYNC_LOG_LIMIT,
      where: accessibleQuery(ability, 'read', 'InstrumentRepoSyncLog')
    });
  }

  async onModuleInit(): Promise<void> {
    // Self-heal any instruments left orphaned by repositories deleted before this logic existed.
    try {
      await this.reconcileOrphanedInstruments();
    } catch (err) {
      this.loggingService.error(`Failed to reconcile orphaned instruments: ${String(err)}`);
    }
  }

  async sync(id: string, { ability }: EntityOperationOptions = {}) {
    const repo = await this.instrumentRepoModel.findFirst({
      where: { AND: [accessibleQuery(ability, 'update', 'InstrumentRepo')], id }
    });
    if (!repo) {
      throw new NotFoundException(`Failed to find instrument repo with ID: ${id}`);
    }
    const result = await this.syncRepo(repo);
    if (!result.ok) {
      throw result.error;
    }
    return result.log;
  }

  /**
   * Sync every repository the caller may update, one at a time. A repository that cannot be read does
   * not stop the rest: its failure is in the sync log returned for it.
   */
  async syncAll({ ability }: EntityOperationOptions = {}) {
    const repos = await this.instrumentRepoModel.findMany({
      where: accessibleQuery(ability, 'update', 'InstrumentRepo')
    });
    const logs = [];
    for (const repo of repos) {
      logs.push((await this.syncRepo(repo)).log);
    }
    return logs;
  }

  /**
   * Reverse {@link encrypt}. Returns undefined if the value cannot be decrypted: a repository whose
   * token is unreadable is still usable if it is public, so this stays recoverable rather than fatal.
   */
  private decrypt(value: string): string | undefined {
    try {
      return decryptSecret(value, this.configService.getOrThrow('SECRET_KEY'));
    } catch (err) {
      this.loggingService.error(`Failed to decrypt stored access token: ${String(err)}`);
      return undefined;
    }
  }

  private discoverInstrumentDirs(repoDir: string): string[] {
    const dirs: string[] = [];
    // `series` is scanned last, and callers must import in the returned order: a series is rejected
    // unless every instrument it references is already stored, so the scalars a repo provides have to
    // be created first. A series referencing a *different* repo still fails; see
    // `.agents/docs/architecture/instrument-pipeline.md`.
    for (const category of ['file', 'forms', 'interactive', 'series']) {
      const libDir = path.join(repoDir, 'lib', category);
      if (!fs.existsSync(libDir)) {
        continue;
      }
      for (const entry of fs.readdirSync(libDir, { withFileTypes: true })) {
        if (!entry.isDirectory()) {
          continue;
        }
        const instrumentDir = path.join(libDir, entry.name);
        const hasIndex = ['index.ts', 'index.tsx', 'index.js', 'index.jsx'].some((f) => {
          return fs.existsSync(path.join(instrumentDir, f));
        });
        if (hasIndex) {
          dirs.push(instrumentDir);
        }
      }
    }
    return dirs;
  }

  // Returns both the extracted instrument root (`repoDir`) and the temp directory that owns it
  // (`tmpDir`); the caller is responsible for removing `tmpDir` once done. They differ because the
  // GitHub archive wraps everything in a single `owner-repo-sha` subdirectory, and the caller must
  // delete the exact directory we created — never its parent (the OS temp root).
  private async downloadAndExtractRepo(
    owner: string,
    repoName: string,
    accessToken?: string
  ): Promise<{ repoDir: string; tmpDir: string }> {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'odc-repo-'));
    // Prefer a repo-specific token, falling back to a server-wide GITHUB_TOKEN if configured.
    const token = accessToken ?? this.configService.get('GITHUB_TOKEN');

    for (const branch of ['main', 'master']) {
      // Download + unpack entirely in-process (Node's fetch + JSZip) so we don't depend on `curl` or
      // `tar` being installed in the runtime container. We hit the API zipball endpoint rather than
      // https://github.com/.../archive/...: the API authenticates the request and then 302-redirects
      // to a *signed* codeload.github.com URL. fetch drops the Authorization header on that
      // cross-origin redirect, but the signed URL no longer needs it — so private repos still work.
      // owner/repoName are already restricted to a strict allowlist in parseGitHubUrl; encode them
      // anyway so nothing can break out of the intended api.github.com path component.
      const zipballUrl = `https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repoName)}/zipball/${branch}`;
      try {
        const headers: { [key: string]: string } = {
          Accept: 'application/vnd.github+json',
          'User-Agent': 'OpenDataCapture',
          'X-GitHub-Api-Version': '2022-11-28'
        };
        if (token) {
          headers.Authorization = `Bearer ${token}`;
        }
        const response = await fetch(zipballUrl, { headers, signal: AbortSignal.timeout(60_000) });
        if (!response.ok) {
          throw new Error(`GitHub responded with status ${response.status}`);
        }
        const archive = Buffer.from(await response.arrayBuffer());
        const repoDir = await this.extractZipArchive(archive, tmpDir);
        return { repoDir, tmpDir };
      } catch {
        // try the next branch
      }
    }

    fs.rmSync(tmpDir, { force: true, recursive: true });
    const hint = token
      ? 'Check that the URL and branch are correct and that the provided access token has permission to read this repository.'
      : 'If this is a private repository, provide a GitHub personal access token. Otherwise, check that the URL is correct.';
    throw new BadGatewayException(`Failed to download repository ${owner}/${repoName}. ${hint}`);
  }

  private encrypt(plaintext: string): string {
    return encryptSecret(plaintext, this.configService.getOrThrow('SECRET_KEY'));
  }

  // Unpack a GitHub zipball into `destDir`, returning the single top-level directory the archive wraps
  // its contents in (e.g. `owner-repo-sha`), or `destDir` itself when there is no single wrapper.
  private async extractZipArchive(archive: Buffer, destDir: string): Promise<string> {
    const zip = await JSZip.loadAsync(archive);
    const resolvedDest = path.resolve(destDir);
    const topLevelEntries = new Set<string>();

    for (const entry of Object.values(zip.files)) {
      const target = path.resolve(destDir, entry.name);
      // Guard against zip-slip: never write outside the temp directory we created.
      if (target !== resolvedDest && !target.startsWith(resolvedDest + path.sep)) {
        continue;
      }
      const topLevel = entry.name.split('/')[0];
      if (topLevel) {
        topLevelEntries.add(topLevel);
      }
      if (entry.dir) {
        fs.mkdirSync(target, { recursive: true });
        continue;
      }
      fs.mkdirSync(path.dirname(target), { recursive: true });
      await fs.promises.writeFile(target, await entry.async('nodebuffer'));
    }

    return topLevelEntries.size === 1 ? path.join(destDir, [...topLevelEntries][0]!) : destDir;
  }

  /**
   * Bundle and create a single instrument from its directory. A failure is returned rather than thrown,
   * with the stage it happened at, so the caller can record it and carry on with the rest of the repo.
   */
  private async importInstrumentFromDir(dir: string): Promise<InstrumentImportResult> {
    const dirName = path.basename(dir);
    let bundleStr: string;
    try {
      const inputs = this.readInstrumentInputs(dir);
      if (inputs.length === 0) {
        this.loggingService.debug(`Skipping ${dirName}: no bundlable files found`);
        return { kind: 'skipped' };
      }
      this.loggingService.debug(`Bundling instrument from ${dirName} (${inputs.length} files)`);
      bundleStr = await bundle({ inputs, minify: true });
    } catch (err) {
      return { kind: 'failed', message: describeImportError(err), stage: 'BUNDLE' };
    }

    try {
      const instrument = await this.instrumentsService.create({ bundle: bundleStr });
      this.loggingService.debug(`Created instrument ${instrument.id} from ${dirName}`);
      return { created: true, id: instrument.id, kind: 'imported' };
    } catch (err) {
      // The instrument already exists (provided by another repo or uploaded manually). Recover its id
      // from the conflict message so we still associate the existing instrument with this repo.
      if (err instanceof ConflictException) {
        const idMatch = /ID '([^']+)'/.exec(err.message);
        if (!idMatch?.[1]) {
          // The message is the only channel carrying the existing id. Losing it drops the instrument
          // from this repo's list, so it is recorded as a failure rather than skipped.
          return {
            kind: 'failed',
            message: `Cannot recover the existing instrument's id from: ${err.message}`,
            stage: 'LOAD'
          };
        }
        this.loggingService.debug(`Instrument from ${dirName} already exists, skipping creation`);
        return { created: false, id: idMatch[1], kind: 'imported' };
      }
      return { kind: 'failed', message: describeImportError(err), stage: 'LOAD' };
    }
  }

  private async importInstruments(owner: string, repoName: string, accessToken?: string): Promise<RepoImportResult> {
    this.loggingService.log(`Downloading ${owner}/${repoName}...`);
    const { repoDir, tmpDir } = await this.downloadAndExtractRepo(owner, repoName, accessToken);

    try {
      const instrumentDirs = this.discoverInstrumentDirs(repoDir);
      this.loggingService.log(`Found ${instrumentDirs.length} instrument directories in ${owner}/${repoName}`);

      // instrumentIds: every instrument the repo provides; createdIds: only those newly created here.
      const instrumentIds: string[] = [];
      const createdIds: string[] = [];
      const failures: InstrumentRepoSyncFailure[] = [];

      for (const dir of instrumentDirs) {
        const result = await this.importInstrumentFromDir(dir);
        if (result.kind === 'failed') {
          // One bad instrument should not abort importing the rest of the repository.
          const failure = { instrumentDir: path.basename(dir), message: result.message, stage: result.stage };
          this.loggingService.error({ error: 'Failed to Import Instrument', ...failure });
          failures.push(failure);
        } else if (result.kind === 'imported') {
          instrumentIds.push(result.id);
          if (result.created) {
            createdIds.push(result.id);
          }
        }
      }

      this.loggingService.log(
        `Imported ${instrumentIds.length} instruments from ${owner}/${repoName} (${failures.length} failed)`
      );
      return { createdIds, failures, instrumentIds };
    } finally {
      // Remove the exact temp directory we created (never its parent, the OS temp root).
      fs.rmSync(tmpDir, { force: true, recursive: true });
    }
  }

  private normalizeUrl(url: string): string {
    // Strip trailing slashes then a single `.git` suffix so `.../repo`, `.../repo/`, and
    // `.../repo.git` all normalize to the same canonical URL. Done with a manual scan rather than a
    // `/\/+$/` regex, which CodeQL flags as polynomial (ReDoS-prone) on attacker-controlled input.
    let end = url.length;
    while (end > 0 && url.charCodeAt(end - 1) === 47 /* '/' */) {
      end -= 1;
    }
    const trimmed = url.slice(0, end);
    return trimmed.endsWith('.git') ? trimmed.slice(0, -4) : trimmed;
  }

  private parseGitHubUrl(url: string): { owner: string; repoName: string } {
    const cleaned = this.normalizeUrl(url);
    const parts = cleaned.split('/');
    const repoName = parts.pop();
    const owner = parts.pop();
    // parts now holds ['https:', '', '<host>']; require the GitHub host and a strict owner/repo so a
    // crafted URL cannot redirect the later GitHub API request elsewhere (server-side request forgery).
    // GitHub owners/repos only ever contain these characters, so this rejects `@`, `:`, `?`, `#`, etc.
    const host = parts[2];
    const validName = /^[A-Za-z0-9._-]+$/;
    if (host !== 'github.com' || !owner || !repoName || !validName.test(owner) || !validName.test(repoName)) {
      throw new BadRequestException('Must be a valid GitHub repository URL (https://github.com/<owner>/<repo>).');
    }
    return { owner, repoName };
  }

  private readInstrumentInputs(instrumentDir: string): BundlerInput[] {
    const inputs: BundlerInput[] = [];
    for (const fileName of fs.readdirSync(instrumentDir)) {
      const filePath = path.join(instrumentDir, fileName);
      if (!fs.statSync(filePath).isFile()) {
        continue;
      }
      if (!BUNDLER_FILE_EXT_REGEX.test(fileName)) {
        continue;
      }
      const loader = inferLoader(fileName);
      const isBinary = loader === 'dataurl';
      const content = isBinary ? fs.readFileSync(filePath) : fs.readFileSync(filePath, 'utf-8');
      inputs.push({ content, name: fileName });
    }
    return inputs;
  }

  /**
   * An instrument is "orphaned" when its source repository no longer exists (e.g. the repo was
   * deleted). For each orphan:
   *  - if an existing repository still provides it (the repo was deleted and re-added), re-attribute
   *    it to that repository so it shows up for groups the repo is assigned to;
   *  - otherwise, if a group has selected it, convert it into a manually-uploaded instrument so it
   *    remains visible and persistent;
   *  - otherwise leave it hidden.
   */
  private async reconcileOrphanedInstruments(): Promise<void> {
    const repos = await this.instrumentRepoModel.findMany({});
    const existingRepoIds = new Set(repos.map((repo) => repo.id));

    // The existing repository (if any) that still provides each instrument.
    const ownerByInstrument = new Map<string, { id: string; name: string }>();
    for (const repo of repos) {
      for (const instrumentId of repo.instrumentIds) {
        if (!ownerByInstrument.has(instrumentId)) {
          ownerByInstrument.set(instrumentId, { id: repo.id, name: repo.name });
        }
      }
    }

    const tagged = await this.instrumentModel.findMany({ where: { sourceRepoId: { not: null } } });
    const orphans = tagged.filter((inst) => inst.sourceRepoId && !existingRepoIds.has(inst.sourceRepoId));
    if (orphans.length === 0) {
      return;
    }

    const groups = await this.groupModel.findMany({});
    const selectedIds = new Set(groups.flatMap((group) => group.accessibleInstrumentIds));

    for (const orphan of orphans) {
      const owner = ownerByInstrument.get(orphan.id);
      if (owner) {
        await this.instrumentModel.update({
          data: { sourceRepoId: owner.id, sourceRepoName: owner.name },
          where: { id: orphan.id }
        });
        this.loggingService.log(`Re-attributed instrument ${orphan.id} to repository '${owner.name}'`);
      } else if (selectedIds.has(orphan.id)) {
        await this.instrumentModel.update({
          data: { sourceRepoId: null, sourceRepoName: null },
          where: { id: orphan.id }
        });
        this.loggingService.log(`Converted orphaned instrument ${orphan.id} to a manual instrument`);
      }
    }
  }

  private recordSync(
    entry: { action: InstrumentRepoSyncAction; repoId: null | string; repoName: string } & (
      { error: unknown } | { failures: InstrumentRepoSyncFailure[]; importedCount: number }
    )
  ) {
    const { action, repoId, repoName } = entry;
    const outcome =
      'error' in entry
        ? { failures: [], importedCount: 0, message: describeImportError(entry.error) }
        : { failures: entry.failures, importedCount: entry.importedCount, message: null };
    return this.instrumentRepoSyncLogModel.create({ data: { action, repoId, repoName, ...outcome } });
  }

  /** Remove the encrypted access token before returning a repo to any client. */
  private stripSecrets<T extends { accessToken?: null | string }>(repo: T): Omit<T, 'accessToken'> {
    const { accessToken: _accessToken, ...rest } = repo;
    return rest;
  }

  private async syncRepo(repo: InstrumentRepoRecord) {
    const accessToken = repo.accessToken ? this.decrypt(repo.accessToken) : undefined;
    let result: RepoImportResult;
    try {
      result = await this.importInstruments(repo.owner, repo.repoName, accessToken);
    } catch (error) {
      const log = await this.recordSync({ action: 'SYNC', error, repoId: repo.id, repoName: repo.name });
      return { error, log, ok: false as const };
    }

    // Only newly-created instruments need provenance set; ones already in the repo already have it.
    await this.tagInstruments(result.createdIds, repo.id, repo.name);

    // Replaced rather than merged, so the list is what the repository provides now. An edition dropped
    // here stays in the database with its provenance tag, so groups can still see and administer it.
    const updated = await this.instrumentRepoModel.update({
      data: { instrumentIds: result.instrumentIds, lastSyncedAt: new Date() },
      where: { id: repo.id }
    });
    const log = await this.recordSync({
      action: 'SYNC',
      failures: result.failures,
      importedCount: result.instrumentIds.length,
      repoId: repo.id,
      repoName: repo.name
    });
    // Re-adopt any instruments that were orphaned by a previously-deleted copy of this repo.
    await this.reconcileOrphanedInstruments();
    return { log, ok: true as const, repo: updated };
  }

  /** Record provenance (repo id + denormalized name) on the given instruments. */
  private async tagInstruments(instrumentIds: string[], repoId: string, repoName: string): Promise<void> {
    for (const id of instrumentIds) {
      await this.instrumentModel.update({
        data: { sourceRepoId: repoId, sourceRepoName: repoName },
        where: { id }
      });
    }
  }
}
