import { ConfigService, getModelToken, LoggingService } from '@douglasneuroinformatics/libnest';
import type { Model } from '@douglasneuroinformatics/libnest';
import { MockFactory } from '@douglasneuroinformatics/libnest/testing';
import type { MockedInstance } from '@douglasneuroinformatics/libnest/testing';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { InstrumentsService } from '../../instruments/instruments.service';
import { InstrumentReposService } from '../instrument-repos.service';

// Typed view onto the service's private members, so tests can exercise them (and stub the network-
// bound import step) without resorting to `any`.
type InternalService = InstrumentReposService & {
  decrypt(value: string): string | undefined;
  encrypt(plaintext: string): string;
  importInstruments(
    owner: string,
    repoName: string,
    accessToken?: string
  ): Promise<{ createdIds: string[]; instrumentIds: string[] }>;
  reconcileOrphanedInstruments(): Promise<void>;
};

describe('InstrumentReposService', () => {
  let service: InstrumentReposService;
  let internal: InternalService;
  let groupModel: MockedInstance<Model<'Group'>>;
  let instrumentModel: MockedInstance<Model<'Instrument'>>;
  let instrumentRepoModel: MockedInstance<Model<'InstrumentRepo'>>;

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

    const configService = moduleRef.get<MockedInstance<ConfigService>>(ConfigService);
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

    it('does nothing when there are no repo-sourced instruments', async () => {
      instrumentRepoModel.findMany.mockResolvedValueOnce([]);
      instrumentModel.findMany.mockResolvedValueOnce([]);

      await internal.reconcileOrphanedInstruments();

      expect(instrumentModel.update).not.toHaveBeenCalled();
    });
  });
});
