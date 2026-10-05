import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';

import { ConfigService, getModelToken, LoggingService } from '@douglasneuroinformatics/libnest';
import type { Model } from '@douglasneuroinformatics/libnest';
import { MockFactory } from '@douglasneuroinformatics/libnest/testing';
import type { MockedInstance } from '@douglasneuroinformatics/libnest/testing';
import { BadGatewayException, BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { bundle } from '@opendatacapture/instrument-bundler';
import JSZip from 'jszip';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { InstrumentsService } from '../../instruments/instruments.service';
import { InstrumentReposService } from '../instrument-repos.service';

vi.mock('@opendatacapture/instrument-bundler', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@opendatacapture/instrument-bundler')>()),
  bundle: vi.fn()
}));

// Typed view onto the service's private members, so tests can exercise them (and stub the network-
// bound import step) without resorting to `any`. Kept as a standalone interface rather than an
// intersection with the class, whose private members would collapse the type to `never`.
type InternalService = {
  decrypt(value: string): string | undefined;
  discoverInstrumentDirs(repoDir: string): string[];
  encrypt(plaintext: string): string;
  importInstruments(
    owner: string,
    repoName: string,
    accessToken?: string
  ): Promise<{ createdIds: string[]; instrumentIds: string[] }>;
  normalizeUrl(url: string): string;
  parseGitHubUrl(url: string): { owner: string; repoName: string };
  reconcileOrphanedInstruments(): Promise<void>;
};

describe('InstrumentReposService', () => {
  let service: InstrumentReposService;
  let internal: InternalService;
  let groupModel: MockedInstance<Model<'Group'>>;
  let instrumentModel: MockedInstance<Model<'Instrument'>>;
  let instrumentRepoModel: MockedInstance<Model<'InstrumentRepo'>>;
  let configService: MockedInstance<ConfigService>;
  let instrumentsService: MockedInstance<InstrumentsService>;
  let loggingService: MockedInstance<LoggingService>;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        InstrumentReposService,
        MockFactory.createForModelToken(getModelToken('Group')),
        MockFactory.createForModelToken(getModelToken('Instrument')),
        MockFactory.createForModelToken(getModelToken('InstrumentRepo')),
        MockFactory.createForService(ConfigService),
        MockFactory.createForService(InstrumentsService),
        MockFactory.createForService(LoggingService)
      ]
    }).compile();
    service = moduleRef.get(InstrumentReposService);
    internal = service as unknown as InternalService;
    groupModel = moduleRef.get(getModelToken('Group'));
    instrumentModel = moduleRef.get(getModelToken('Instrument'));
    instrumentRepoModel = moduleRef.get(getModelToken('InstrumentRepo'));

    configService = moduleRef.get(ConfigService);
    instrumentsService = moduleRef.get(InstrumentsService);
    loggingService = moduleRef.get(LoggingService);
    configService.getOrThrow.mockReturnValue('test-secret-key');

    // Sensible defaults so the reconciliation pass (which several methods trigger) never operates on
    // undefined collections.
    groupModel.findMany.mockResolvedValue([]);
    groupModel.count.mockResolvedValue(0);
    instrumentModel.findMany.mockResolvedValue([]);
    instrumentRepoModel.findMany.mockResolvedValue([]);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('token encryption', () => {
    it('encrypts and decrypts a token round-trip', () => {
      const token = 'ghp_super_secret_token';
      const encrypted = internal.encrypt(token);
      // Stored as `iv.authTag.ciphertext`, never the plaintext.
      expect(encrypted).not.toBe(token);
      expect(encrypted.split('.')).toHaveLength(3);
      expect(internal.decrypt(encrypted)).toBe(token);
    });

    it('returns undefined when decrypting a malformed value', () => {
      expect(internal.decrypt('not-a-valid-token')).toBeUndefined();
    });
  });

  describe('normalizeUrl', () => {
    it.each([
      ['https://github.com/owner/repo', 'https://github.com/owner/repo'],
      ['https://github.com/owner/repo/', 'https://github.com/owner/repo'],
      ['https://github.com/owner/repo.git', 'https://github.com/owner/repo'],
      ['https://github.com/owner/repo.git/', 'https://github.com/owner/repo'],
      ['https://github.com/owner/repo///', 'https://github.com/owner/repo']
    ])('normalizes %s to %s', (input, expected) => {
      expect(internal.normalizeUrl(input)).toBe(expected);
    });

    it('does not hang on input with many trailing slashes', () => {
      const input = `https://github.com/owner/repo${'/'.repeat(100_000)}`;
      expect(internal.normalizeUrl(input)).toBe('https://github.com/owner/repo');
    });
  });

  describe('parseGitHubUrl', () => {
    it('extracts the owner and repo from a valid github URL', () => {
      expect(internal.parseGitHubUrl('https://github.com/owner/repo.git')).toEqual({
        owner: 'owner',
        repoName: 'repo'
      });
    });

    it.each([
      'https://gitlab.com/owner/repo',
      'https://github.com.evil.com/owner/repo',
      'https://github.com/owner@evil.com/repo',
      'https://github.com/owner/repo?x=y',
      'https://github.com/owner'
    ])('rejects a crafted URL that could forge a request: %s', (url) => {
      // Guards against SSRF: only github.com with a strict owner/repo may reach the GitHub API call.
      expect(() => internal.parseGitHubUrl(url)).toThrow(BadRequestException);
    });
  });

  describe('findAll', () => {
    it('strips the access token from every repo before returning', async () => {
      instrumentRepoModel.findMany.mockResolvedValueOnce([
        { accessToken: 'encrypted', id: '1', instrumentIds: [], name: 'repo' }
      ]);
      const result = await service.findAll();
      expect(result[0]).not.toHaveProperty('accessToken');
      expect(result[0]).toMatchObject({ id: '1', name: 'repo' });
    });
  });

  describe('findById', () => {
    it('throws a NotFoundException when the repo does not exist', async () => {
      instrumentRepoModel.findFirst.mockResolvedValueOnce(null);
      await expect(service.findById('missing')).rejects.toBeInstanceOf(NotFoundException);
    });

    it('strips the access token from the returned repo', async () => {
      instrumentRepoModel.findFirst.mockResolvedValueOnce({ accessToken: 'encrypted', id: '1', name: 'repo' });
      await expect(service.findById('1')).resolves.not.toHaveProperty('accessToken');
    });
  });

  describe('deleteById', () => {
    it('throws a NotFoundException when the repo does not exist', async () => {
      instrumentRepoModel.findFirst.mockResolvedValueOnce(null);
      await expect(service.deleteById('missing')).rejects.toBeInstanceOf(NotFoundException);
    });

    it('throws a ConflictException when a group still uses the repo', async () => {
      instrumentRepoModel.findFirst.mockResolvedValueOnce({ id: '1', name: 'repo' });
      groupModel.count.mockResolvedValueOnce(1);
      await expect(service.deleteById('1')).rejects.toBeInstanceOf(ConflictException);
      expect(instrumentRepoModel.delete).not.toHaveBeenCalled();
    });

    it('deletes the repo and strips secrets when no group uses it', async () => {
      instrumentRepoModel.findFirst.mockResolvedValueOnce({ id: '1', name: 'repo' });
      groupModel.count.mockResolvedValueOnce(0);
      instrumentRepoModel.delete.mockResolvedValueOnce({ accessToken: 'encrypted', id: '1', name: 'repo' });
      const result = await service.deleteById('1');
      expect(instrumentRepoModel.delete).toHaveBeenCalledWith({ where: { id: '1' } });
      expect(result).not.toHaveProperty('accessToken');
    });
  });

  describe('create', () => {
    it('imports a new repo, parsing owner/repoName from the URL and storing an encrypted token', async () => {
      const importSpy = vi
        .spyOn(internal, 'importInstruments')
        .mockResolvedValue({ createdIds: ['i1'], instrumentIds: ['i1'] });
      instrumentRepoModel.findFirst.mockResolvedValueOnce(null);
      instrumentRepoModel.create.mockResolvedValueOnce({ id: 'r1', name: 'repo' });

      const result = await service.create({ accessToken: 'tok', url: 'https://github.com/owner/repo' });

      expect(importSpy).toHaveBeenCalledWith('owner', 'repo', 'tok');
      expect(instrumentRepoModel.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            // stringContaining('.') proves the value is the `iv.tag.ct` ciphertext, not the plaintext.
            accessToken: expect.stringContaining('.'),
            name: 'repo',
            owner: 'owner',
            repoName: 'repo',
            url: 'https://github.com/owner/repo'
          })
        })
      );
      expect(result).not.toHaveProperty('accessToken');
    });

    it('stores a null token when none is provided', async () => {
      vi.spyOn(internal, 'importInstruments').mockResolvedValue({ createdIds: [], instrumentIds: [] });
      instrumentRepoModel.findFirst.mockResolvedValueOnce(null);
      instrumentRepoModel.create.mockResolvedValueOnce({ id: 'r1', name: 'repo' });

      await service.create({ url: 'https://github.com/owner/repo' });

      expect(instrumentRepoModel.create).toHaveBeenCalledWith(
        expect.objectContaining({ data: expect.objectContaining({ accessToken: null }) })
      );
    });

    it('re-syncs an already-registered repo instead of creating a duplicate', async () => {
      instrumentRepoModel.findFirst.mockResolvedValueOnce({ id: 'existing' });
      const syncSpy = vi.spyOn(service, 'sync').mockResolvedValue({ id: 'existing' } as never);

      const result = await service.create({ url: 'https://github.com/owner/repo' });

      expect(syncSpy).toHaveBeenCalledWith('existing');
      expect(instrumentRepoModel.create).not.toHaveBeenCalled();
      expect(result).toMatchObject({ id: 'existing' });
    });

    it('persists an updated token before re-syncing an existing repo', async () => {
      instrumentRepoModel.findFirst.mockResolvedValueOnce({ id: 'existing' });
      vi.spyOn(service, 'sync').mockResolvedValue({ id: 'existing' } as never);

      await service.create({ accessToken: 'new-token', url: 'https://github.com/owner/repo' });

      expect(instrumentRepoModel.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ accessToken: expect.stringContaining('.') }),
          where: { id: 'existing' }
        })
      );
    });

    it('does not touch the stored token when re-adding without one', async () => {
      instrumentRepoModel.findFirst.mockResolvedValueOnce({ id: 'existing' });
      vi.spyOn(service, 'sync').mockResolvedValue({ id: 'existing' } as never);

      await service.create({ url: 'https://github.com/owner/repo' });

      expect(instrumentRepoModel.update).not.toHaveBeenCalled();
    });
  });

  describe('sync', () => {
    it('throws a NotFoundException when the repo does not exist', async () => {
      instrumentRepoModel.findFirst.mockResolvedValueOnce(null);
      await expect(service.sync('missing')).rejects.toBeInstanceOf(NotFoundException);
    });

    it('decrypts the stored token, unions the instrument ids, and strips secrets', async () => {
      const encryptedToken = internal.encrypt('stored-token');
      instrumentRepoModel.findFirst.mockResolvedValueOnce({
        accessToken: encryptedToken,
        id: 'r1',
        instrumentIds: ['old'],
        name: 'repo',
        owner: 'owner',
        repoName: 'repo'
      });
      const importSpy = vi
        .spyOn(internal, 'importInstruments')
        .mockResolvedValue({ createdIds: ['new'], instrumentIds: ['new'] });
      instrumentRepoModel.update.mockResolvedValueOnce({ accessToken: encryptedToken, id: 'r1', name: 'repo' });

      const result = await service.sync('r1');

      // The decrypted token (not the ciphertext) is what gets used to fetch the repo.
      expect(importSpy).toHaveBeenCalledWith('owner', 'repo', 'stored-token');
      expect(instrumentRepoModel.update).toHaveBeenCalledWith(
        expect.objectContaining({ data: expect.objectContaining({ instrumentIds: ['old', 'new'] }) })
      );
      expect(result).not.toHaveProperty('accessToken');
    });

    it('should download without a token when the repo stores none, so public repos sync', async () => {
      instrumentRepoModel.findFirst.mockResolvedValueOnce({
        accessToken: null,
        id: 'r1',
        instrumentIds: [],
        name: 'repo',
        owner: 'owner',
        repoName: 'repo'
      });
      const importSpy = vi
        .spyOn(internal, 'importInstruments')
        .mockResolvedValue({ createdIds: [], instrumentIds: [] });
      instrumentRepoModel.update.mockResolvedValueOnce({ id: 'r1' });

      await service.sync('r1');

      expect(importSpy).toHaveBeenCalledWith('owner', 'repo', undefined);
    });
  });

  describe('onModuleInit', () => {
    it('should reconcile orphaned instruments at startup', async () => {
      await service.onModuleInit();
      expect(instrumentModel.findMany).toHaveBeenCalledWith({ where: { sourceRepoId: { not: null } } });
    });

    it('should log rather than crash the boot when reconciliation fails', async () => {
      instrumentRepoModel.findMany.mockRejectedValueOnce(new Error('database down'));
      await expect(service.onModuleInit()).resolves.toBeUndefined();
      expect(loggingService.error).toHaveBeenCalledWith(
        'Failed to reconcile orphaned instruments: Error: database down'
      );
    });
  });

  describe('reconcileOrphanedInstruments', () => {
    it('re-attributes an orphan to an existing repo that still provides it', async () => {
      instrumentRepoModel.findMany.mockResolvedValueOnce([{ id: 'repoA', instrumentIds: ['i1'], name: 'A' }]);
      instrumentModel.findMany.mockResolvedValueOnce([{ id: 'i1', sourceRepoId: 'deleted', sourceRepoName: 'old' }]);

      await internal.reconcileOrphanedInstruments();

      expect(instrumentModel.update).toHaveBeenCalledWith({
        data: { sourceRepoId: 'repoA', sourceRepoName: 'A' },
        where: { id: 'i1' }
      });
    });

    it('converts an orphan selected by a group into a manual instrument', async () => {
      instrumentRepoModel.findMany.mockResolvedValueOnce([]);
      instrumentModel.findMany.mockResolvedValueOnce([{ id: 'i1', sourceRepoId: 'deleted', sourceRepoName: 'old' }]);
      groupModel.findMany.mockResolvedValueOnce([{ accessibleInstrumentIds: ['i1'] }]);

      await internal.reconcileOrphanedInstruments();

      expect(instrumentModel.update).toHaveBeenCalledWith({
        data: { sourceRepoId: null, sourceRepoName: null },
        where: { id: 'i1' }
      });
    });

    it('leaves an orphan untouched when no repo provides it and no group selected it', async () => {
      instrumentRepoModel.findMany.mockResolvedValueOnce([]);
      instrumentModel.findMany.mockResolvedValueOnce([{ id: 'i1', sourceRepoId: 'deleted', sourceRepoName: 'old' }]);
      groupModel.findMany.mockResolvedValueOnce([{ accessibleInstrumentIds: [] }]);

      await internal.reconcileOrphanedInstruments();

      expect(instrumentModel.update).not.toHaveBeenCalled();
    });

    it('should re-attribute an orphan to the first repo that provides it when several do', async () => {
      instrumentRepoModel.findMany.mockResolvedValueOnce([
        { id: 'repoA', instrumentIds: ['i1'], name: 'A' },
        { id: 'repoB', instrumentIds: ['i1'], name: 'B' }
      ]);
      instrumentModel.findMany.mockResolvedValueOnce([{ id: 'i1', sourceRepoId: 'deleted', sourceRepoName: 'old' }]);

      await internal.reconcileOrphanedInstruments();

      expect(instrumentModel.update).toHaveBeenCalledOnce();
      expect(instrumentModel.update).toHaveBeenCalledWith({
        data: { sourceRepoId: 'repoA', sourceRepoName: 'A' },
        where: { id: 'i1' }
      });
    });

    it('should leave an instrument alone while its repo exists or when it carries no repo', async () => {
      instrumentRepoModel.findMany.mockResolvedValueOnce([{ id: 'repoA', instrumentIds: [], name: 'A' }]);
      instrumentModel.findMany.mockResolvedValueOnce([
        { id: 'i1', sourceRepoId: 'repoA', sourceRepoName: 'A' },
        { id: 'i2', sourceRepoId: null, sourceRepoName: null }
      ]);

      await internal.reconcileOrphanedInstruments();

      expect(groupModel.findMany).not.toHaveBeenCalled();
      expect(instrumentModel.update).not.toHaveBeenCalled();
    });

    it('does nothing when there are no repo-sourced instruments', async () => {
      instrumentRepoModel.findMany.mockResolvedValueOnce([]);
      instrumentModel.findMany.mockResolvedValueOnce([]);

      await internal.reconcileOrphanedInstruments();

      expect(instrumentModel.update).not.toHaveBeenCalled();
    });
  });

  describe('discoverInstrumentDirs', () => {
    let repoDir: string;

    const writeInstrument = (category: string, name: string) => {
      const dir = path.join(repoDir, 'lib', category, name);
      fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(path.join(dir, 'index.ts'), 'export default {};');
    };

    beforeEach(() => {
      repoDir = fs.mkdtempSync(path.join(os.tmpdir(), 'odc-repo-'));
    });

    afterEach(() => {
      fs.rmSync(repoDir, { force: true, recursive: true });
    });

    it('should discover every instrument category, so a repo does not silently lose its series', () => {
      writeInstrument('file', 'SCAN');
      writeInstrument('forms', 'HAPPINESS');
      writeInstrument('interactive', 'CLICK');
      writeInstrument('series', 'HAPPINESS_WITH_CONSENT');

      const found = internal.discoverInstrumentDirs(repoDir).map((dir) => path.basename(dir));

      expect(found.sort()).toStrictEqual(['CLICK', 'HAPPINESS', 'HAPPINESS_WITH_CONSENT', 'SCAN']);
    });

    it('should return series after every scalar, because a series cannot be stored before its items', () => {
      writeInstrument('series', 'HAPPINESS_WITH_CONSENT');
      writeInstrument('forms', 'HAPPINESS');
      writeInstrument('interactive', 'CLICK');

      const found = internal.discoverInstrumentDirs(repoDir).map((dir) => path.basename(dir));

      expect(found.at(-1)).toBe('HAPPINESS_WITH_CONSENT');
    });

    it('should ignore a directory without an index file', () => {
      writeInstrument('forms', 'HAPPINESS');
      fs.mkdirSync(path.join(repoDir, 'lib', 'forms', 'README_ONLY'), { recursive: true });

      const found = internal.discoverInstrumentDirs(repoDir).map((dir) => path.basename(dir));

      expect(found).toStrictEqual(['HAPPINESS']);
    });
  });

  describe('importing a repository', () => {
    const url = 'https://github.com/owner/repo';
    const wrapper = 'owner-repo-abc123';
    let tempRoot: string;
    let fetchMock: ReturnType<typeof vi.fn<typeof fetch>>;

    const zipball = async (files: { [name: string]: Buffer | string }, prefix = `${wrapper}/`) => {
      const zip = new JSZip();
      for (const [name, content] of Object.entries(files)) {
        zip.file(`${prefix}${name}`, content);
      }
      return new Response(await zip.generateAsync({ type: 'arraybuffer' }));
    };

    const instrumentFiles = (category: string, name: string) => ({
      [`lib/${category}/${name}/index.ts`]: `export default '${name}';`
    });

    const fetchedUrls = () => fetchMock.mock.calls.map(([input]) => input);

    const fetchedHeaders = () => fetchMock.mock.calls[0]?.[1]?.headers;

    beforeEach(() => {
      tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'odc-repos-spec-'));
      // os.tmpdir() reads TMPDIR, so every directory the import creates lands where the test can see it.
      vi.stubEnv('TMPDIR', tempRoot);
      fetchMock = vi.fn<typeof fetch>();
      vi.stubGlobal('fetch', fetchMock);
      vi.mocked(bundle)
        .mockReset()
        .mockImplementation(({ inputs }) => Promise.resolve(`bundle:${inputs.map((input) => input.name).join(',')}`));
      instrumentRepoModel.findFirst.mockResolvedValue(null);
      instrumentRepoModel.create.mockImplementation(({ data }) => Promise.resolve({ ...data, id: 'repo-1' }));
      instrumentsService.create.mockResolvedValue({ id: 'created' });
    });

    afterEach(() => {
      vi.unstubAllEnvs();
      vi.unstubAllGlobals();
      fs.rmSync(tempRoot, { force: true, recursive: true });
    });

    it('should request the main branch zipball from the GitHub API with the repo token', async () => {
      fetchMock.mockResolvedValueOnce(await zipball({}));

      await service.create({ accessToken: 'repo-token', url });

      expect(fetchedUrls()).toStrictEqual(['https://api.github.com/repos/owner/repo/zipball/main']);
      expect(fetchedHeaders()).toMatchObject({ Authorization: 'Bearer repo-token' });
    });

    it('should fall back to the server-wide token when the repo has none', async () => {
      configService.get.mockReturnValue('server-token');
      fetchMock.mockResolvedValueOnce(await zipball({}));

      await service.create({ url });

      expect(configService.get).toHaveBeenCalledWith('GITHUB_TOKEN');
      expect(fetchedHeaders()).toMatchObject({ Authorization: 'Bearer server-token' });
    });

    it('should send no authorization header when no token is configured', async () => {
      fetchMock.mockResolvedValueOnce(await zipball({}));

      await service.create({ url });

      expect(fetchedHeaders()).not.toHaveProperty('Authorization');
    });

    it('should fall back to the master branch when main cannot be downloaded', async () => {
      fetchMock.mockResolvedValueOnce(new Response(null, { status: 404 }));
      fetchMock.mockResolvedValueOnce(await zipball(instrumentFiles('forms', 'A')));

      await service.create({ url });

      expect(fetchedUrls()).toStrictEqual([
        'https://api.github.com/repos/owner/repo/zipball/main',
        'https://api.github.com/repos/owner/repo/zipball/master'
      ]);
      expect(instrumentRepoModel.create.mock.lastCall?.[0].data.instrumentIds).toStrictEqual(['created']);
    });

    it('should suggest an access token when an unauthenticated download fails on both branches', async () => {
      fetchMock.mockResolvedValue(new Response(null, { status: 404 }));

      const result = service.create({ url });

      await expect(result).rejects.toBeInstanceOf(BadGatewayException);
      await expect(result).rejects.toThrow('provide a GitHub personal access token');
      expect(instrumentRepoModel.create).not.toHaveBeenCalled();
    });

    it("should point at the token's permissions when an authenticated download fails on both branches", async () => {
      fetchMock.mockRejectedValue(new Error('network down'));

      await expect(service.create({ accessToken: 'repo-token', url })).rejects.toThrow(
        'the provided access token has permission to read this repository'
      );
    });

    it('should remove its temporary directory whether or not the download succeeds', async () => {
      const discoverSpy = vi.spyOn(internal, 'discoverInstrumentDirs');
      fetchMock.mockResolvedValueOnce(await zipball(instrumentFiles('forms', 'A')));
      await service.create({ url });
      expect(discoverSpy.mock.lastCall?.[0].startsWith(tempRoot)).toBe(true);
      fetchMock.mockResolvedValue(new Response(null, { status: 500 }));
      await expect(service.create({ url })).rejects.toBeInstanceOf(BadGatewayException);

      expect(fs.readdirSync(tempRoot)).toStrictEqual([]);
    });

    it('should bundle every discovered instrument, series last, and record provenance only on those it created', async () => {
      fetchMock.mockResolvedValueOnce(
        await zipball({
          ...instrumentFiles('series', 'S'),
          ...instrumentFiles('forms', 'A'),
          ...instrumentFiles('file', 'F')
        })
      );
      instrumentsService.create
        .mockResolvedValueOnce({ id: 'file-id' })
        .mockResolvedValueOnce({ id: 'form-id' })
        .mockResolvedValueOnce({ id: 'series-id' });

      await service.create({ url });

      expect(instrumentRepoModel.create.mock.lastCall?.[0].data.instrumentIds).toStrictEqual([
        'file-id',
        'form-id',
        'series-id'
      ]);
      expect(instrumentModel.update.mock.calls.map(([args]) => args)).toStrictEqual(
        ['file-id', 'form-id', 'series-id'].map((id) => ({
          data: { sourceRepoId: 'repo-1', sourceRepoName: 'repo' },
          where: { id }
        }))
      );
    });

    it('should associate an instrument that already exists without taking over its provenance', async () => {
      fetchMock.mockResolvedValueOnce(await zipball(instrumentFiles('forms', 'A')));
      instrumentsService.create.mockRejectedValueOnce(
        new ConflictException("Instrument with ID 'existing' already exists!")
      );

      await service.create({ url });

      expect(instrumentRepoModel.create.mock.lastCall?.[0].data.instrumentIds).toStrictEqual(['existing']);
      expect(instrumentModel.update).not.toHaveBeenCalled();
    });

    it('should log a conflict that does not name the existing instrument and leave it out', async () => {
      const message = 'An instrument with the same title already exists';
      fetchMock.mockResolvedValueOnce(await zipball(instrumentFiles('forms', 'A')));
      instrumentsService.create.mockRejectedValueOnce(new ConflictException(message));

      await service.create({ url });

      expect(instrumentRepoModel.create.mock.lastCall?.[0].data.instrumentIds).toStrictEqual([]);
      expect(loggingService.error).toHaveBeenCalledWith({
        conflictMessage: message,
        error: 'Cannot recover instrument id from conflict',
        instrumentDir: 'A'
      });
    });

    it('should log an instrument that fails to import and carry on with the rest', async () => {
      const cause = new Error('invalid instrument');
      fetchMock.mockResolvedValueOnce(
        await zipball({ ...instrumentFiles('forms', 'A'), ...instrumentFiles('forms', 'B') })
      );
      instrumentsService.create.mockRejectedValueOnce(cause).mockResolvedValueOnce({ id: 'b-id' });

      await service.create({ url });

      expect(loggingService.error).toHaveBeenCalledWith({
        cause,
        error: 'Failed to Import Instrument',
        instrumentDir: 'A'
      });
      expect(instrumentRepoModel.create.mock.lastCall?.[0].data.instrumentIds).toStrictEqual(['b-id']);
    });

    it('should read media as binary and skip files the bundler cannot load', async () => {
      const image = Buffer.from([0x89, 0x50, 0x4e, 0x47]);
      fetchMock.mockResolvedValueOnce(
        await zipball({
          ...instrumentFiles('forms', 'A'),
          'lib/forms/A/logo.png': image,
          'lib/forms/A/README.md': '# A'
        })
      );

      await service.create({ url });

      const inputs = vi.mocked(bundle).mock.lastCall?.[0].inputs;
      expect(inputs).toHaveLength(2);
      expect(inputs).toContainEqual({ content: "export default 'A';", name: 'index.ts' });
      expect(inputs).toContainEqual({ content: image, name: 'logo.png' });
    });

    it('should skip an instrument directory with nothing to bundle', async () => {
      const zip = new JSZip();
      zip.folder(`${wrapper}/lib/forms/A/index.ts`);
      fetchMock.mockResolvedValueOnce(new Response(await zip.generateAsync({ type: 'arraybuffer' })));

      await service.create({ url });

      expect(bundle).not.toHaveBeenCalled();
      expect(instrumentRepoModel.create.mock.lastCall?.[0].data.instrumentIds).toStrictEqual([]);
    });

    it('should ignore loose files beside the instrument directories', async () => {
      fetchMock.mockResolvedValueOnce(await zipball({ ...instrumentFiles('forms', 'A'), 'lib/forms/notes.ts': '' }));

      await service.create({ url });

      expect(bundle).toHaveBeenCalledOnce();
    });

    it('should read an archive that has no single wrapping directory', async () => {
      fetchMock.mockResolvedValueOnce(await zipball({ ...instrumentFiles('forms', 'A'), 'README.md': '# repo' }, ''));

      await service.create({ url });

      expect(instrumentRepoModel.create.mock.lastCall?.[0].data.instrumentIds).toStrictEqual(['created']);
    });

    it('should never write an archive entry outside its temporary directory', async () => {
      const outside = path.join(tempRoot, 'outside', 'evil.ts');
      const zip = new JSZip();
      zip.file(outside, 'pwned');
      for (const [name, content] of Object.entries(instrumentFiles('forms', 'A'))) {
        zip.file(`${wrapper}/${name}`, content);
      }
      fetchMock.mockResolvedValueOnce(new Response(await zip.generateAsync({ type: 'arraybuffer' })));

      await service.create({ url });

      expect(fs.existsSync(outside)).toBe(false);
      expect(instrumentRepoModel.create.mock.lastCall?.[0].data.instrumentIds).toStrictEqual(['created']);
    });

    it('should treat an archive entry that resolves to the extraction directory itself as a failed download', async () => {
      const zip = new JSZip();
      // JSZip resolves `x/..` to an empty name on load, which targets the extraction root.
      zip.file('x/..', 'overwrite');
      fetchMock.mockResolvedValueOnce(new Response(await zip.generateAsync({ type: 'arraybuffer' })));
      fetchMock.mockResolvedValueOnce(await zipball(instrumentFiles('forms', 'A')));

      await service.create({ url });

      expect(fetchedUrls().at(-1)).toBe('https://api.github.com/repos/owner/repo/zipball/master');
      expect(instrumentRepoModel.create.mock.lastCall?.[0].data.instrumentIds).toStrictEqual(['created']);
    });
  });
});
