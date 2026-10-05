import type { Model, RequestUser } from '@douglasneuroinformatics/libnest';
import { getModelToken } from '@douglasneuroinformatics/libnest';
import { MockFactory } from '@douglasneuroinformatics/libnest/testing';
import type { MockedInstance } from '@douglasneuroinformatics/libnest/testing';
import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  NotFoundException,
  UnprocessableEntityException
} from '@nestjs/common';
import { Test } from '@nestjs/testing';
import type { FileInstrument } from '@opendatacapture/runtime-core';
import type { $FileLocation, $FileMetadata } from '@opendatacapture/schemas/storage';
import { beforeEach, describe, expect, it } from 'vitest';
import { z } from 'zod/v4';

import { accessibleQuery, createAppAbility } from '@/auth/ability.utils';
import type { AppAbility } from '@/auth/auth.types';
import { InstrumentsService } from '@/instruments/instruments.service';
import { StorageService } from '@/storage/storage.service';

import { FilesService } from '../files.service';

type FoundInstrument = Awaited<ReturnType<InstrumentsService['findById']>>;

const RECORD_ID = 'record-1';

const createFileGroup = (basename: string, count: FileInstrument.FileGroup['count']): FileInstrument.FileGroup => ({
  basename,
  count,
  label: basename,
  type: null
});

const createInstrument = (fileGroups: FileInstrument.FileGroup[]): FoundInstrument => ({
  __runtimeVersion: 1,
  bundle: '',
  content: { fileGroups },
  details: { description: 'Uploaded files', license: 'Apache-2.0', title: 'Files' },
  id: 'instrument-1',
  internal: { edition: 1, name: 'FILES' },
  kind: 'FILE',
  language: 'en',
  measures: null,
  tags: [],
  validationSchema: z.any()
});

const createCurrentUser = (ability: AppAbility): RequestUser => ({
  ability,
  basePermissionLevel: null,
  firstName: null,
  groups: [],
  id: 'user-1',
  kind: 'login',
  lastName: null,
  mustResetPassword: false,
  permissions: [],
  username: 'jane.doe'
});

const createFile = (basename: string, index: number) => ({
  basename,
  groupId: 'group-1',
  id: `${basename}-${index}`,
  index,
  name: `${basename}-${index}.csv`,
  recordId: RECORD_ID,
  size: 100 + index
});

const createUpload = (location: $FileLocation): $FileMetadata => ({
  location,
  name: `${location.basename}-${location.index}.csv`,
  size: 10
});

const presignedUrlFor = ({ location }: { location: $FileLocation }) => ({
  exp: 1700000000,
  location,
  url: `https://storage.example.org/${location.basename}/${location.index}`
});

describe('FilesService', () => {
  let filesService: FilesService;
  let instrumentRecordModel: MockedInstance<Model<'InstrumentRecord'>>;
  let instrumentsService: MockedInstance<InstrumentsService>;
  let storageService: MockedInstance<StorageService>;

  const adminUser = createCurrentUser(createAppAbility([{ action: 'manage', subject: 'all' }]));

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        FilesService,
        MockFactory.createForModelToken(getModelToken('InstrumentRecord')),
        MockFactory.createForService(InstrumentsService),
        MockFactory.createForService(StorageService)
      ]
    }).compile();
    filesService = moduleRef.get(FilesService);
    instrumentRecordModel = moduleRef.get(getModelToken('InstrumentRecord'));
    instrumentsService = moduleRef.get(InstrumentsService);
    storageService = moduleRef.get(StorageService);
    storageService.getPresignedDownloadUrl.mockImplementation((params) => Promise.resolve(presignedUrlFor(params)));
    storageService.getPresignedUploadUrl.mockImplementation((params) => Promise.resolve(presignedUrlFor(params)));
  });

  describe('find', () => {
    it('should scope the record and its files to what the user can read', async () => {
      const ability = createAppAbility([
        { action: 'read', conditions: { groupId: 'group-1' }, subject: 'InstrumentRecord' },
        { action: 'read', conditions: { groupId: 'group-1' }, subject: 'InstrumentRecordFile' }
      ]);
      instrumentRecordModel.findUnique.mockResolvedValueOnce(null);
      await expect(filesService.find(RECORD_ID, createCurrentUser(ability))).rejects.toThrow();
      expect(instrumentRecordModel.findUnique.mock.lastCall?.[0]).toMatchObject({
        where: {
          AND: [
            accessibleQuery(ability, 'read', 'InstrumentRecord'),
            { files: { every: accessibleQuery(ability, 'read', 'InstrumentRecordFile') } }
          ],
          id: RECORD_ID
        }
      });
    });

    it('should throw a not found exception when the record is not accessible', async () => {
      instrumentRecordModel.findUnique.mockResolvedValueOnce(null);
      await expect(filesService.find(RECORD_ID, adminUser)).rejects.toBeInstanceOf(NotFoundException);
    });

    it('should refuse a record whose instrument is not a file instrument', async () => {
      instrumentRecordModel.findUnique.mockResolvedValueOnce({ files: [], instrumentId: 'instrument-1' });
      instrumentsService.findById.mockResolvedValueOnce({ ...createInstrument([]), content: [], kind: 'SERIES' });
      await expect(filesService.find(RECORD_ID, adminUser)).rejects.toBeInstanceOf(UnprocessableEntityException);
    });

    it('should group files by basename in index order, each with a presigned download url', async () => {
      instrumentRecordModel.findUnique.mockResolvedValueOnce({
        files: [createFile('scan', 1), createFile('notes', 0), createFile('scan', 0)],
        instrumentId: 'instrument-1'
      });
      instrumentsService.findById.mockResolvedValueOnce(
        createInstrument([createFileGroup('scan', { max: 2, min: 1 }), createFileGroup('audio', { max: 1, min: 0 })])
      );
      await expect(filesService.find(RECORD_ID, adminUser)).resolves.toEqual({
        audio: [],
        scan: [
          { exp: 1700000000, name: 'scan-0.csv', size: 100, url: 'https://storage.example.org/scan/0' },
          { exp: 1700000000, name: 'scan-1.csv', size: 101, url: 'https://storage.example.org/scan/1' }
        ]
      });
    });

    it('should request download urls for the storage key of each file', async () => {
      instrumentRecordModel.findUnique.mockResolvedValueOnce({
        files: [createFile('scan', 0)],
        instrumentId: 'instrument-1'
      });
      instrumentsService.findById.mockResolvedValueOnce(
        createInstrument([createFileGroup('scan', { max: 1, min: 1 })])
      );
      await filesService.find(RECORD_ID, adminUser);
      expect(storageService.getPresignedDownloadUrl).toHaveBeenCalledWith({
        groupId: 'group-1',
        location: { basename: 'scan', index: 0 },
        recordId: RECORD_ID
      });
    });
  });

  describe('getPresignedUploadUrls', () => {
    it('should throw a not found exception when the record does not exist', async () => {
      instrumentRecordModel.findUnique.mockResolvedValueOnce(null);
      await expect(filesService.getPresignedUploadUrls(RECORD_ID, adminUser)).rejects.toBeInstanceOf(NotFoundException);
    });

    it('should throw a conflict exception once the upload is complete, so files cannot be replaced', async () => {
      instrumentRecordModel.findUnique.mockResolvedValueOnce({
        groupId: 'group-1',
        instrumentId: 'instrument-1',
        pending: false
      });
      await expect(filesService.getPresignedUploadUrls(RECORD_ID, adminUser)).rejects.toBeInstanceOf(ConflictException);
    });

    it("should forbid uploading files to a record in a group outside the user's grant", async () => {
      const ability = createAppAbility([
        { action: 'create', conditions: { groupId: 'group-1' }, subject: 'InstrumentRecordFile' }
      ]);
      instrumentRecordModel.findUnique.mockResolvedValueOnce({
        groupId: 'group-2',
        instrumentId: 'instrument-1',
        pending: true
      });
      await expect(filesService.getPresignedUploadUrls(RECORD_ID, createCurrentUser(ability))).rejects.toBeInstanceOf(
        ForbiddenException
      );
    });

    it('should return one presigned upload url per allowed file in each group', async () => {
      instrumentRecordModel.findUnique.mockResolvedValueOnce({
        groupId: 'group-1',
        instrumentId: 'instrument-1',
        pending: true
      });
      instrumentsService.findById.mockResolvedValueOnce(
        createInstrument([createFileGroup('scan', { max: 2, min: 1 }), createFileGroup('notes', { max: 1, min: 0 })])
      );
      await expect(filesService.getPresignedUploadUrls(RECORD_ID, adminUser)).resolves.toEqual({
        notes: [presignedUrlFor({ location: { basename: 'notes', index: 0 } })],
        scan: [
          presignedUrlFor({ location: { basename: 'scan', index: 0 } }),
          presignedUrlFor({ location: { basename: 'scan', index: 1 } })
        ]
      });
    });

    it("should request upload urls under the record's group", async () => {
      instrumentRecordModel.findUnique.mockResolvedValueOnce({
        groupId: 'group-1',
        instrumentId: 'instrument-1',
        pending: true
      });
      instrumentsService.findById.mockResolvedValueOnce(
        createInstrument([createFileGroup('scan', { max: 1, min: 1 })])
      );
      await filesService.getPresignedUploadUrls(RECORD_ID, adminUser);
      expect(storageService.getPresignedUploadUrl).toHaveBeenCalledWith({
        groupId: 'group-1',
        location: { basename: 'scan', index: 0 },
        recordId: RECORD_ID
      });
    });
  });

  describe('setUploadComplete', () => {
    const mockPendingRecord = (groupId: null | string) => {
      instrumentRecordModel.findUnique.mockResolvedValueOnce({ groupId, instrumentId: 'instrument-1', pending: true });
    };

    it('should create the uploaded files connected to the record group and mark the record complete', async () => {
      mockPendingRecord('group-1');
      instrumentsService.findById.mockResolvedValueOnce(
        createInstrument([createFileGroup('scan', { max: 1, min: 1 })])
      );
      await filesService.setUploadComplete(
        RECORD_ID,
        { uploads: { scan: [createUpload({ basename: 'scan', index: 0 })] } },
        adminUser
      );
      expect(instrumentRecordModel.update).toHaveBeenCalledWith({
        data: {
          files: {
            create: [
              { basename: 'scan', group: { connect: { id: 'group-1' } }, index: 0, name: 'scan-0.csv', size: 10 }
            ]
          },
          pending: false
        },
        where: { id: RECORD_ID }
      });
    });

    it('should create files without a group for a record collected outside any group', async () => {
      mockPendingRecord(null);
      instrumentsService.findById.mockResolvedValueOnce(
        createInstrument([createFileGroup('scan', { max: 1, min: 1 })])
      );
      await filesService.setUploadComplete(
        RECORD_ID,
        { uploads: { scan: [createUpload({ basename: 'scan', index: 0 })] } },
        adminUser
      );
      expect(instrumentRecordModel.update.mock.lastCall?.[0]).toMatchObject({
        data: { files: { create: [{ group: undefined }] } }
      });
    });

    it('should reject an exact-count group with the wrong number of files', async () => {
      mockPendingRecord('group-1');
      instrumentsService.findById.mockResolvedValueOnce(
        createInstrument([createFileGroup('scan', { max: 1, min: 1 })])
      );
      const uploads = {
        scan: [createUpload({ basename: 'scan', index: 0 }), createUpload({ basename: 'scan', index: 1 })]
      };
      await expect(filesService.setUploadComplete(RECORD_ID, { uploads }, adminUser)).rejects.toThrow(
        new BadRequestException("Invalid file count for file group 'scan': expected 1 file(s), but got '2'")
      );
    });

    it('should reject a missing group whose minimum is above zero, describing the allowed range', async () => {
      mockPendingRecord('group-1');
      instrumentsService.findById.mockResolvedValueOnce(
        createInstrument([createFileGroup('scan', { max: 3, min: 1 })])
      );
      await expect(filesService.setUploadComplete(RECORD_ID, { uploads: {} }, adminUser)).rejects.toThrow(
        new BadRequestException(
          "Invalid file count for file group 'scan': expected between 1 and 3 file(s), but got '0'"
        )
      );
    });

    it('should not mark the record complete when the file count is invalid', async () => {
      mockPendingRecord('group-1');
      instrumentsService.findById.mockResolvedValueOnce(
        createInstrument([createFileGroup('scan', { max: 1, min: 1 })])
      );
      await expect(filesService.setUploadComplete(RECORD_ID, { uploads: {} }, adminUser)).rejects.toThrow();
      expect(instrumentRecordModel.update).not.toHaveBeenCalled();
    });
  });
});
