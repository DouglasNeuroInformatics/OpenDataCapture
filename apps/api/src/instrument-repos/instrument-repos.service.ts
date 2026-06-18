import { createCipheriv, createDecipheriv, createHash, randomBytes } from 'node:crypto';
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';

import { ConfigService, InjectModel, LoggingService } from '@douglasneuroinformatics/libnest';
import type { Model } from '@douglasneuroinformatics/libnest';
import {
  BadGatewayException,
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException
} from '@nestjs/common';
import type { OnModuleInit } from '@nestjs/common';
import { bundle, BUNDLER_FILE_EXT_REGEX, inferLoader } from '@opendatacapture/instrument-bundler';
import type { BundlerInput } from '@opendatacapture/instrument-bundler';
import JSZip from 'jszip';

import { accessibleQuery } from '@/auth/ability.utils';
import type { EntityOperationOptions } from '@/core/types';
import { InstrumentsService } from '@/instruments/instruments.service';

import type { CreateInstrumentRepoDto } from './dto/create-instrument-repo.dto';

@Injectable()
export class InstrumentReposService implements OnModuleInit {
  constructor(
    @InjectModel('Group') private readonly groupModel: Model<'Group'>,
    @InjectModel('InstrumentRepo') private readonly instrumentRepoModel: Model<'InstrumentRepo'>,
    @InjectModel('Instrument') private readonly instrumentModel: Model<'Instrument'>,
    private readonly configService: ConfigService,
    private readonly instrumentsService: InstrumentsService,
    private readonly loggingService: LoggingService
  ) {}

  async create({ accessToken, url }: CreateInstrumentRepoDto) {
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
      return this.sync(existing.id);
    }

    const { createdIds, instrumentIds } = await this.importInstruments(owner, repoName, accessToken);

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

  async findAll({ ability }: EntityOperationOptions = {}) {
    const repos = await this.instrumentRepoModel.findMany({
      where: accessibleQuery(ability, 'read', 'InstrumentRepo')
    });
    return repos.map((repo) => this.stripSecrets(repo));
  }

  async findById(id: string, { ability }: EntityOperationOptions = {}) {
    const repo = await this.instrumentRepoModel.findFirst({
      where: { AND: [accessibleQuery(ability, 'read', 'InstrumentRepo')], id }
    });
    if (!repo) {
      throw new NotFoundException(`Failed to find instrument repo with ID: ${id}`);
    }
    return this.stripSecrets(repo);
  }

  async onModuleInit(): Promise<void> {
    // Self-heal any instruments left orphaned by repositories deleted before this logic existed.
    try {
      await this.reconcileOrphanedInstruments();
    } catch (err) {
      this.loggingService.error(`Failed to reconcile orphaned instruments: ${String(err)}`);
    }
  }

  async sync(id: string) {
    const repo = await this.instrumentRepoModel.findFirst({ where: { id } });
    if (!repo) {
      throw new NotFoundException(`Failed to find instrument repo with ID: ${id}`);
    }

    const accessToken = repo.accessToken ? this.decrypt(repo.accessToken) : undefined;
    const { createdIds, instrumentIds } = await this.importInstruments(repo.owner, repo.repoName, accessToken);

    const allInstrumentIds = [...new Set([...repo.instrumentIds, ...instrumentIds])];

    // Only newly-created instruments need provenance set; ones already in the repo already have it.
    await this.tagInstruments(createdIds, repo.id, repo.name);

    const updated = await this.instrumentRepoModel.update({
      data: {
        instrumentIds: allInstrumentIds,
        lastSyncedAt: new Date()
      },
      where: { id }
    });
    // Re-adopt any instruments that were orphaned by a previously-deleted copy of this repo.
    await this.reconcileOrphanedInstruments();

    return this.stripSecrets(updated);
  }

  /** Reverse {@link encrypt}. Returns undefined if the value cannot be decrypted. */
  private decrypt(value: string): string | undefined {
    try {
      const [ivB64, authTagB64, ciphertextB64] = value.split('.');
      if (!ivB64 || !authTagB64 || !ciphertextB64) {
        return undefined;
      }
      const decipher = createDecipheriv('aes-256-gcm', this.encryptionKey(), Buffer.from(ivB64, 'base64'));
      decipher.setAuthTag(Buffer.from(authTagB64, 'base64'));
      const plaintext = Buffer.concat([decipher.update(Buffer.from(ciphertextB64, 'base64')), decipher.final()]);
      return plaintext.toString('utf8');
    } catch (err) {
      this.loggingService.error(`Failed to decrypt stored access token: ${String(err)}`);
      return undefined;
    }
  }

  private discoverInstrumentDirs(repoDir: string): string[] {
    const dirs: string[] = [];
    for (const category of ['forms', 'interactive']) {
      const libDir = path.join(repoDir, 'lib', category);
      if (!fs.existsSync(libDir)) {
        continue;
      }
      for (const entry of fs.readdirSync(libDir, { withFileTypes: true })) {
        if (!entry.isDirectory()) {
          continue;
        }
        const instrumentDir = path.join(libDir, entry.name);
        const hasIndex = ['index.ts', 'index.tsx', 'index.js', 'index.jsx'].some((f) =>
          fs.existsSync(path.join(instrumentDir, f))
        );
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
    const token = accessToken ?? process.env.GITHUB_TOKEN;

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

  /** Encrypt a secret with AES-256-GCM, returning `iv.authTag.ciphertext` (all base64). */
  private encrypt(plaintext: string): string {
    const iv = randomBytes(12);
    const cipher = createCipheriv('aes-256-gcm', this.encryptionKey(), iv);
    const ciphertext = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
    const authTag = cipher.getAuthTag();
    return [iv.toString('base64'), authTag.toString('base64'), ciphertext.toString('base64')].join('.');
  }

  /** Derive a 32-byte AES key from the server SECRET_KEY. */
  private encryptionKey(): Buffer {
    const secret = this.configService.getOrThrow('SECRET_KEY');
    return createHash('sha256').update(secret).digest();
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
   * Bundle and create a single instrument from its directory. Returns its id and whether it was newly
   * created, or `null` when there is nothing to import (no bundlable files). Re-throws unexpected
   * errors so the caller can log and skip just this instrument.
   */
  private async importInstrumentFromDir(dir: string): Promise<null | { created: boolean; id: string }> {
    const dirName = path.basename(dir);
    const inputs = this.readInstrumentInputs(dir);
    if (inputs.length === 0) {
      this.loggingService.debug(`Skipping ${dirName}: no bundlable files found`);
      return null;
    }

    this.loggingService.debug(`Bundling instrument from ${dirName} (${inputs.length} files)`);
    const bundleStr = await bundle({ inputs, minify: true });
    try {
      const instrument = await this.instrumentsService.create({ bundle: bundleStr });
      this.loggingService.debug(`Created instrument ${instrument.id} from ${dirName}`);
      return { created: true, id: instrument.id };
    } catch (err) {
      // The instrument already exists (provided by another repo or uploaded manually). Recover its id
      // from the conflict message so we still associate the existing instrument with this repo.
      if (err instanceof ConflictException) {
        const idMatch = /ID '([^']+)'/.exec(err.message);
        this.loggingService.debug(`Instrument from ${dirName} already exists, skipping creation`);
        return idMatch?.[1] ? { created: false, id: idMatch[1] } : null;
      }
      throw err;
    }
  }

  private async importInstruments(
    owner: string,
    repoName: string,
    accessToken?: string
  ): Promise<{ createdIds: string[]; instrumentIds: string[] }> {
    this.loggingService.log(`Downloading ${owner}/${repoName}...`);
    const { repoDir, tmpDir } = await this.downloadAndExtractRepo(owner, repoName, accessToken);

    try {
      const instrumentDirs = this.discoverInstrumentDirs(repoDir);
      this.loggingService.log(`Found ${instrumentDirs.length} instrument directories in ${owner}/${repoName}`);

      // instrumentIds: every instrument the repo provides; createdIds: only those newly created here.
      const instrumentIds: string[] = [];
      const createdIds: string[] = [];

      for (const dir of instrumentDirs) {
        try {
          const result = await this.importInstrumentFromDir(dir);
          if (!result) {
            continue;
          }
          instrumentIds.push(result.id);
          if (result.created) {
            createdIds.push(result.id);
          }
        } catch (err) {
          // One bad instrument should not abort importing the rest of the repository.
          this.loggingService.error(`Failed to import instrument from ${path.basename(dir)}: ${String(err)}`);
        }
      }

      this.loggingService.log(`Imported ${instrumentIds.length} instruments from ${owner}/${repoName}`);
      return { createdIds, instrumentIds };
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

  /** Remove the encrypted access token before returning a repo to any client. */
  private stripSecrets<T extends { accessToken?: null | string }>(repo: T): Omit<T, 'accessToken'> {
    const { accessToken: _accessToken, ...rest } = repo;
    return rest;
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
