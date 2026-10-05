import { EventEmitter } from 'events';
import { Worker } from 'worker_threads';

import type { Model } from '@douglasneuroinformatics/libnest';
import { getModelToken, LoggingService, PRISMA_CLIENT_TOKEN } from '@douglasneuroinformatics/libnest';
import { MockFactory } from '@douglasneuroinformatics/libnest/testing';
import type { MockedInstance } from '@douglasneuroinformatics/libnest/testing';
import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
  ServiceUnavailableException,
  UnprocessableEntityException
} from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { DEFAULT_GROUP_NAME } from '@opendatacapture/schemas/core';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { AbilityFactory } from '@/auth/ability.factory';
import { accessibleQuery, createAppAbility } from '@/auth/ability.utils';
import { StorageService } from '@/storage/storage.service';
import { UsersService } from '@/users/users.service';

import { GroupsService } from '../../groups/groups.service';
import { InstrumentsService } from '../../instruments/instruments.service';
import { SessionsService } from '../../sessions/sessions.service';
import { SubjectsService } from '../../subjects/subjects.service';
import { InstrumentMeasuresService } from '../instrument-measures.service';
import { InstrumentRecordsService } from '../instrument-records.service';

import type { RecordType } from '../thread-types';

// Every export runs the real worker unless a test swaps in a FakeWorker, so the protocol is exercised
// end to end while the failure modes the real worker never produces can still be driven.
vi.mock('worker_threads', async (importOriginal) => {
  const actual = await importOriginal<typeof import('worker_threads')>();
  return {
    ...actual,
    Worker: vi.fn(function (filename: string) {
      return new actual.Worker(filename);
    })
  };
});

class FakeWorker extends EventEmitter {
  postMessage = vi.fn();
  terminate = vi.fn(() => Promise.resolve(0));
}

function useFakeWorker() {
  const fakeWorker = new FakeWorker();
  vi.mocked(Worker).mockImplementationOnce(function () {
    return fakeWorker as unknown as Worker;
  });
  return fakeWorker;
}

describe('InstrumentRecordsService', () => {
  let groupsService: MockedInstance<GroupsService>;
  let instrumentMeasuresService: MockedInstance<InstrumentMeasuresService>;
  let loggingService: MockedInstance<LoggingService>;
  let storageService: MockedInstance<StorageService>;
  let fileModel: MockedInstance<Model<'InstrumentRecordFile'>>;
  const transaction = vi.fn();
  let instrumentRecordsService: InstrumentRecordsService;
  let instrumentRecordModel: MockedInstance<Model<'InstrumentRecord'>>;
  let sessionModel: MockedInstance<Model<'Session'>>;
  let instrumentsService: MockedInstance<InstrumentsService>;
  let sessionsService: MockedInstance<SessionsService>;
  let subjectsService: MockedInstance<SubjectsService>;
  let usersService: MockedInstance<UsersService>;

  beforeEach(async () => {
    transaction.mockReset();
    const recordProvider = MockFactory.createForModelToken(getModelToken('InstrumentRecord'));
    const fileProvider = MockFactory.createForModelToken(getModelToken('InstrumentRecordFile'));
    const moduleRef = await Test.createTestingModule({
      providers: [
        InstrumentRecordsService,
        recordProvider,
        fileProvider,
        MockFactory.createForService(LoggingService),
        {
          inject: [getModelToken('InstrumentRecord'), getModelToken('InstrumentRecordFile')],
          provide: PRISMA_CLIENT_TOKEN,
          useFactory: (
            instrumentRecord: Model<'InstrumentRecord'>,
            instrumentRecordFile: Model<'InstrumentRecordFile'>
          ) => ({
            $transaction: transaction,
            instrumentRecord,
            instrumentRecordFile
          })
        },
        MockFactory.createForModelToken(getModelToken('Session')),
        MockFactory.createForService(GroupsService),
        MockFactory.createForService(UsersService),
        MockFactory.createForService(InstrumentMeasuresService),
        MockFactory.createForService(InstrumentsService),
        MockFactory.createForService(SessionsService),
        MockFactory.createForService(StorageService),
        MockFactory.createForService(SubjectsService)
      ]
    }).compile();

    groupsService = moduleRef.get(GroupsService);
    instrumentMeasuresService = moduleRef.get(InstrumentMeasuresService);
    fileModel = moduleRef.get(getModelToken('InstrumentRecordFile'));
    storageService = moduleRef.get(StorageService);
    loggingService = moduleRef.get(LoggingService);
    instrumentRecordModel = moduleRef.get(getModelToken('InstrumentRecord'));
    sessionModel = moduleRef.get(getModelToken('Session'));
    instrumentRecordsService = moduleRef.get(InstrumentRecordsService);
    instrumentsService = moduleRef.get(InstrumentsService);
    sessionsService = moduleRef.get(SessionsService);
    subjectsService = moduleRef.get(SubjectsService);
    usersService = moduleRef.get(UsersService);
  });

  afterEach(() => {
    vi.mocked(Worker).mockReset();
  });

  describe('deleteById', () => {
    const file = { basename: 'file', groupId: 'group-1', id: 'file-1', index: 0, recordId: 'record-1' };
    const storageFile = { groupId: 'group-1', location: { basename: 'file', index: 0 }, recordId: 'record-1' };

    beforeEach(() => {
      instrumentRecordModel.findFirst.mockResolvedValue({ id: 'record-1' });
      fileModel.findMany.mockResolvedValue([file]);
      transaction.mockResolvedValue([{ count: 1 }, { id: 'record-1' }]);
    });

    it('should apply delete permissions before looking up files and again when deleting', async () => {
      const ability = createAppAbility([
        { action: 'delete', conditions: { groupId: 'group-1' }, subject: 'InstrumentRecord' }
      ]);
      await instrumentRecordsService.deleteById('record-1', { ability });
      const where = { AND: [accessibleQuery(ability, 'delete', 'InstrumentRecord')], id: 'record-1' };
      expect(instrumentRecordModel.findFirst).toHaveBeenCalledWith({ where });
      expect(instrumentRecordModel.delete).toHaveBeenCalledWith({ where });
      expect(fileModel.findMany).toHaveBeenCalledWith({ where: { recordId: 'record-1' } });
      expect(instrumentRecordModel.findFirst).toHaveBeenCalledBefore(fileModel.findMany);
    });

    it('should delete the collected file rows before the record in one transaction', async () => {
      const fileOperation = Promise.resolve({ count: 1 });
      const recordOperation = Promise.resolve({ id: 'record-1' });
      fileModel.deleteMany.mockReturnValueOnce(fileOperation);
      instrumentRecordModel.delete.mockReturnValueOnce(recordOperation);
      await expect(instrumentRecordsService.deleteById('record-1')).resolves.toEqual({ id: 'record-1' });
      expect(transaction).toHaveBeenCalledWith([fileOperation, recordOperation]);
      expect(fileModel.deleteMany).toHaveBeenCalledWith({ where: { id: { in: ['file-1'] } } });
      expect(fileModel.findMany).toHaveBeenCalledBefore(fileModel.deleteMany);
    });

    it('should wait for the transaction to commit before deleting storage objects', async () => {
      const commit = Promise.withResolvers<unknown[]>();
      transaction.mockReturnValueOnce(commit.promise);
      const deletion = instrumentRecordsService.deleteById('record-1');
      await vi.waitFor(() => expect(transaction).toHaveBeenCalledOnce());
      expect(storageService.deleteObjects).not.toHaveBeenCalled();
      commit.resolve([{ count: 1 }, { id: 'record-1' }]);
      await deletion;
      expect(storageService.deleteObjects).toHaveBeenCalledWith([storageFile]);
    });

    it('should leave storage untouched if the database transaction fails', async () => {
      transaction.mockRejectedValueOnce(new Error('transaction failed'));
      await expect(instrumentRecordsService.deleteById('record-1')).rejects.toThrow('transaction failed');
      expect(storageService.deleteObjects).not.toHaveBeenCalled();
    });

    it('should log orphaned objects without failing an already committed deletion', async () => {
      const error = new Error('storage failed');
      storageService.deleteObjects.mockRejectedValueOnce(error);
      await expect(instrumentRecordsService.deleteById('record-1')).resolves.toEqual({ id: 'record-1' });
      expect(loggingService.error).toHaveBeenCalledWith({
        error,
        files: [storageFile],
        message: expect.stringContaining('orphaned objects require cleanup')
      });
    });

    it('should delete records without files', async () => {
      fileModel.findMany.mockResolvedValueOnce([]);
      await expect(instrumentRecordsService.deleteById('record-1')).resolves.toEqual({ id: 'record-1' });
      expect(storageService.deleteObjects).toHaveBeenCalledWith([]);
    });

    it('should report a missing or inaccessible record without reading its files', async () => {
      instrumentRecordModel.findFirst.mockResolvedValueOnce(null);
      const ability = createAppAbility([
        { action: 'delete', conditions: { groupId: 'other-group' }, subject: 'InstrumentRecord' }
      ]);
      await expect(instrumentRecordsService.deleteById('record-1', { ability })).rejects.toBeInstanceOf(
        NotFoundException
      );
      expect(fileModel.findMany).not.toHaveBeenCalled();
      expect(transaction).not.toHaveBeenCalled();
      expect(storageService.deleteObjects).not.toHaveBeenCalled();
    });

    it('should refuse callers without a delete rule before querying clinical data', async () => {
      await expect(
        instrumentRecordsService.deleteById('record-1', { ability: createAppAbility([]) })
      ).rejects.toThrow();
      expect(instrumentRecordModel.findFirst).not.toHaveBeenCalled();
      expect(fileModel.findMany).not.toHaveBeenCalled();
      expect(transaction).not.toHaveBeenCalled();
    });
  });

  describe('findById', () => {
    it('should throw a NotFoundException if no record is found', async () => {
      instrumentRecordModel.findFirst.mockResolvedValueOnce(null);
      await expect(instrumentRecordsService.findById('nonexistent-id')).rejects.toBeInstanceOf(NotFoundException);
    });

    it('should return the instrument record with the correct shape', async () => {
      const mockRecord = {
        data: { test: 'data' },
        date: new Date(),
        id: 'test-record-id',
        instrumentId: 'test-instrument-id',
        sessionId: 'test-session-id',
        subjectId: 'test-subject-id'
      };

      instrumentRecordModel.findFirst.mockResolvedValueOnce(mockRecord);

      const result = await instrumentRecordsService.findById('test-record-id');

      expect(result).toMatchObject({
        data: { test: 'data' },
        id: 'test-record-id',
        instrumentId: 'test-instrument-id',
        sessionId: 'test-session-id',
        subjectId: 'test-subject-id'
      });
      expect(result.date).toBeInstanceOf(Date);
    });
  });

  describe('create', () => {
    const mockFormInstrument = {
      id: 'form-1',
      kind: 'FORM',
      measures: null,
      validationSchema: {
        safeParse: (data: unknown) => ({ data, success: true })
      }
    };

    const baseCreateData = {
      data: { answer: 1 },
      date: new Date(),
      instrumentId: 'form-1',
      sessionId: 'session-1',
      subjectId: 'subject-1'
    };

    beforeEach(() => {
      subjectsService.findById.mockResolvedValue({ id: 'subject-1' } as any);
      sessionsService.findById.mockResolvedValue({ id: 'session-1' } as any);
      instrumentRecordModel.create.mockResolvedValue({ id: 'record-1' } as any);
    });

    it('should persist the series instrument reference when provided', async () => {
      instrumentsService.findById.mockImplementation((id: string) => {
        if (id === 'series-1') {
          return Promise.resolve({ id: 'series-1', kind: 'SERIES' } as any);
        }
        return Promise.resolve(mockFormInstrument as any);
      });
      await instrumentRecordsService.create({ ...baseCreateData, seriesInstrumentId: 'series-1' });
      expect(instrumentRecordModel.create.mock.lastCall?.[0]).toMatchObject({
        data: {
          instrument: { connect: { id: 'form-1' } },
          seriesInstrument: { connect: { id: 'series-1' } }
        }
      });
    });

    it('should authorize and scope instrument lookups to the record group', async () => {
      const ability = { can: () => true } as any;
      instrumentsService.findById.mockImplementation((id: string) => {
        if (id === 'series-1') {
          return Promise.resolve({ id: 'series-1', kind: 'SERIES' } as any);
        }
        return Promise.resolve(mockFormInstrument as any);
      });

      await instrumentRecordsService.create(
        { ...baseCreateData, groupId: 'group-1', seriesInstrumentId: 'series-1' },
        { ability }
      );

      const expectedOptions = { ability };
      expect(instrumentsService.findById).toHaveBeenNthCalledWith(1, 'form-1', expectedOptions, ['group-1']);
      expect(instrumentsService.findById).toHaveBeenNthCalledWith(2, 'series-1', expectedOptions, ['group-1']);
    });

    it('should not connect a series instrument when none is provided', async () => {
      instrumentsService.findById.mockResolvedValue(mockFormInstrument as any);
      await instrumentRecordsService.create(baseCreateData);
      expect(instrumentRecordModel.create.mock.lastCall?.[0].data.seriesInstrument).toBeUndefined();
    });

    it('should reject a series instrument, since only its scalar items hold records', async () => {
      instrumentsService.findById.mockResolvedValue({ id: 'series-1', kind: 'SERIES' });
      await expect(
        instrumentRecordsService.create({ ...baseCreateData, instrumentId: 'series-1' })
      ).rejects.toBeInstanceOf(UnprocessableEntityException);
      expect(instrumentRecordModel.create).not.toHaveBeenCalled();
    });

    it('should refuse a file instrument when storage is disabled, so no record waits for an upload that cannot happen', async () => {
      instrumentsService.findById.mockResolvedValue({ ...mockFormInstrument, kind: 'FILE' });
      Object.assign(storageService, { isEnabled: false });
      await expect(instrumentRecordsService.create(baseCreateData)).rejects.toBeInstanceOf(ServiceUnavailableException);
      expect(instrumentRecordModel.create).not.toHaveBeenCalled();
    });

    it('should create a file record as pending, since its files are attached afterwards', async () => {
      instrumentsService.findById.mockResolvedValue({ ...mockFormInstrument, kind: 'FILE' });
      Object.assign(storageService, { isEnabled: true });
      await instrumentRecordsService.create(baseCreateData);
      expect(instrumentRecordModel.create.mock.lastCall?.[0]).toMatchObject({ data: { pending: true } });
    });

    it('should report the validation issues when the data does not match the instrument schema', async () => {
      const issues = [{ message: 'Required', path: ['answer'] }];
      instrumentsService.findById.mockResolvedValue({
        ...mockFormInstrument,
        validationSchema: { safeParse: () => ({ error: { issues }, success: false }) }
      });
      await expect(instrumentRecordsService.create(baseCreateData)).rejects.toMatchObject({
        response: { issues, statusCode: 422 }
      });
      expect(instrumentRecordModel.create).not.toHaveBeenCalled();
    });

    it('should store the measures computed from the submitted data', async () => {
      const measures = { score: { kind: 'computed', label: 'Score', value: () => 1 } };
      instrumentsService.findById.mockResolvedValue({ ...mockFormInstrument, measures });
      instrumentMeasuresService.computeMeasures.mockReturnValueOnce({ score: 1 });
      await instrumentRecordsService.create(baseCreateData);
      expect(instrumentMeasuresService.computeMeasures).toHaveBeenCalledWith(measures, { answer: 1 });
      expect(instrumentRecordModel.create.mock.lastCall?.[0]).toMatchObject({
        data: { computedMeasures: { score: 1 } }
      });
    });

    it('should connect the record to the group it was collected in', async () => {
      instrumentsService.findById.mockResolvedValue(mockFormInstrument as any);
      await instrumentRecordsService.create({ ...baseCreateData, groupId: 'group-1' });
      expect(instrumentRecordModel.create.mock.lastCall?.[0]).toMatchObject({
        data: { group: { connect: { id: 'group-1' } }, pending: false }
      });
    });

    it('should reject a seriesInstrumentId that references a non-series instrument', async () => {
      instrumentsService.findById.mockResolvedValue(mockFormInstrument as any);
      await expect(
        instrumentRecordsService.create({ ...baseCreateData, seriesInstrumentId: 'form-1' })
      ).rejects.toBeInstanceOf(UnprocessableEntityException);
      expect(instrumentRecordModel.create).not.toHaveBeenCalled();
    });
  });

  describe('upload', () => {
    const mockInstrument = {
      id: 'instrument-1',
      kind: 'FORM',
      measures: null,
      validationSchema: {
        safeParse: (data: unknown) => ({ data, success: true })
      }
    };

    const mockSession = {
      date: new Date(),
      groupId: null,
      id: 'session-1',
      type: 'RETROSPECTIVE',
      userId: null
    };

    const baseUploadData = {
      instrumentId: 'instrument-1',
      records: [{ data: { answer: 1 }, date: new Date(), subjectId: 'subject-1' }]
    };

    beforeEach(() => {
      instrumentsService.findById.mockResolvedValue(mockInstrument as any);
      subjectsService.createMany.mockResolvedValue([] as any);
      sessionsService.createMany.mockResolvedValue([mockSession] as any);
      sessionsService.deleteByIds.mockResolvedValue(undefined as any);
      instrumentRecordModel.createMany.mockResolvedValue([] as any);
      instrumentRecordModel.findMany.mockResolvedValue([] as any);
    });

    it('should look the instrument up with the caller ability, so the lookup is scoped like every other read', async () => {
      const ability = createAppAbility([{ action: 'create', subject: 'InstrumentRecord' }]);

      await instrumentRecordsService.upload({ ...baseUploadData }, { ability });

      expect(instrumentsService.findById).toHaveBeenCalledWith('instrument-1', { ability });
    });

    it('should return only the records keyed on the sessions it created, so an upload without a group never reads other groups', async () => {
      const foreignRecord = { groupId: 'other-group', id: 'record-2', instrumentId: 'instrument-1' };
      instrumentRecordModel.findMany.mockResolvedValueOnce([foreignRecord] as any);

      const result = await instrumentRecordsService.upload({ ...baseUploadData });

      expect(instrumentRecordModel.findMany).toHaveBeenCalledWith({ where: { sessionId: { in: ['session-1'] } } });
      expect(result).toStrictEqual([foreignRecord]);
    });

    it('should create the sessions in one batched call carrying the provided username', async () => {
      usersService.findByUsername.mockResolvedValueOnce({ groups: [{ id: 'group-1' }], username: 'validuser' } as any);

      await instrumentRecordsService.upload({ ...baseUploadData, groupId: 'group-1', username: 'validuser' });

      expect(usersService.findByUsername).toHaveBeenCalledWith('validuser', undefined);
      expect(sessionsService.create).not.toHaveBeenCalled();
      expect(sessionsService.createMany).toHaveBeenCalledTimes(1);
      expect(sessionsService.createMany).toHaveBeenCalledWith(
        expect.objectContaining({ groupId: 'group-1', type: 'RETROSPECTIVE', username: 'validuser' }),
        undefined
      );
    });

    it('should create the sessions with the caller ability, so their group and user lookups are scoped', async () => {
      const ability = createAppAbility([{ action: 'create', subject: 'InstrumentRecord' }]);

      await instrumentRecordsService.upload({ ...baseUploadData }, { ability });

      expect(sessionsService.createMany).toHaveBeenCalledWith(expect.anything(), { ability });
    });

    it('should batch every record into a single session creation call', async () => {
      const records = Array.from({ length: 25 }, (_, i) => ({
        data: { answer: i },
        date: new Date(),
        subjectId: `subject-${i}`
      }));
      sessionsService.createMany.mockResolvedValueOnce(
        records.map((_, i) => ({ ...mockSession, id: `session-${i}` })) as any
      );

      await instrumentRecordsService.upload({ ...baseUploadData, records });

      expect(sessionsService.createMany).toHaveBeenCalledTimes(1);
      const [call] = sessionsService.createMany.mock.lastCall as [{ entries: unknown[] }];
      expect(call.entries).toHaveLength(25);
    });

    it('should pair each record with the session created for it, by position', async () => {
      const records = [
        { data: { answer: 1 }, date: new Date(), subjectId: 'subject-a' },
        { data: { answer: 2 }, date: new Date(), subjectId: 'subject-b' }
      ];
      sessionsService.createMany.mockResolvedValueOnce([
        { ...mockSession, id: 'session-a' },
        { ...mockSession, id: 'session-b' }
      ] as any);

      await instrumentRecordsService.upload({ ...baseUploadData, records });

      expect(instrumentRecordModel.createMany.mock.lastCall?.[0]).toMatchObject({
        data: [
          { sessionId: 'session-a', subjectId: 'subject-a' },
          { sessionId: 'session-b', subjectId: 'subject-b' }
        ]
      });
    });

    it('should throw a ForbiddenException when a non-admin user uploads without a group', async () => {
      usersService.findByUsername.mockResolvedValueOnce({
        basePermissionLevel: 'STANDARD',
        username: 'validuser'
      } as any);

      await expect(
        instrumentRecordsService.upload({ ...baseUploadData, username: 'validuser' })
      ).rejects.toBeInstanceOf(ForbiddenException);

      expect(sessionsService.createMany).not.toHaveBeenCalled();
    });

    it('should throw a ForbiddenException when a user uploads to a group they are not a member of', async () => {
      usersService.findByUsername.mockResolvedValueOnce({
        groups: [{ id: 'other-group' }],
        username: 'validuser'
      } as any);

      await expect(
        instrumentRecordsService.upload({ ...baseUploadData, groupId: 'group-1', username: 'validuser' })
      ).rejects.toBeInstanceOf(ForbiddenException);

      expect(sessionsService.createMany).not.toHaveBeenCalled();
    });

    it('should reject and not create any sessions when an unknown username is provided', async () => {
      usersService.findByUsername.mockRejectedValueOnce(
        new NotFoundException('Failed to find user with username: spoofed')
      );

      await expect(instrumentRecordsService.upload({ ...baseUploadData, username: 'spoofed' })).rejects.toBeInstanceOf(
        NotFoundException
      );

      expect(sessionsService.createMany).not.toHaveBeenCalled();
    });

    it('should create the sessions with username undefined when no username is provided', async () => {
      await instrumentRecordsService.upload({ ...baseUploadData });

      expect(usersService.findByUsername).not.toHaveBeenCalled();
      expect(sessionsService.createMany).toHaveBeenCalledWith(
        expect.objectContaining({ username: undefined }),
        undefined
      );
    });

    it('should reject an invalid record before creating any sessions', async () => {
      instrumentsService.findById.mockResolvedValue({
        ...mockInstrument,
        validationSchema: { safeParse: () => ({ error: { issues: [] }, success: false }) }
      } as any);

      await expect(instrumentRecordsService.upload({ ...baseUploadData })).rejects.toBeInstanceOf(
        UnprocessableEntityException
      );

      expect(sessionsService.createMany).not.toHaveBeenCalled();
      expect(instrumentRecordModel.createMany).not.toHaveBeenCalled();
    });

    it('should report which record failed and why, so a rejected batch can be corrected', async () => {
      const issues = [{ message: 'Required', path: ['answer'] }];
      instrumentsService.findById.mockResolvedValue({
        ...mockInstrument,
        validationSchema: {
          safeParse: (data: any) =>
            data.answer === 2 ? { error: { issues }, success: false } : { data, success: true }
        }
      } as any);

      await expect(
        instrumentRecordsService.upload({
          ...baseUploadData,
          records: [
            { data: { answer: 1 }, date: new Date(), subjectId: 'subject-1' },
            { data: { answer: 2 }, date: new Date(), subjectId: 'subject-2' }
          ]
        })
      ).rejects.toMatchObject({
        response: { issues, message: expect.stringContaining('at index 1') }
      });
    });

    it('should roll back the sessions when the record insert fails, so none is left without records', async () => {
      instrumentRecordModel.createMany.mockRejectedValueOnce(new Error('insert failed'));

      await expect(instrumentRecordsService.upload({ ...baseUploadData })).rejects.toThrow('insert failed');

      expect(sessionsService.deleteByIds).toHaveBeenCalledWith(['session-1']);
    });

    it('should keep the sessions when only the read-back fails, since the records already reference them', async () => {
      instrumentRecordModel.findMany.mockRejectedValueOnce(new Error('read-back failed'));

      await expect(instrumentRecordsService.upload({ ...baseUploadData })).rejects.toThrow('read-back failed');

      expect(sessionsService.deleteByIds).not.toHaveBeenCalled();
    });

    // The bulk payload cannot carry a file and this path never attaches one, so such a record could
    // only ever be incomplete. Refusing it is the same call `create` makes for series instruments.
    it('should reject a file instrument rather than write a record its files can never reach', async () => {
      instrumentsService.findById.mockResolvedValue({ ...mockInstrument, kind: 'FILE' } as any);

      await expect(instrumentRecordsService.upload({ ...baseUploadData })).rejects.toBeInstanceOf(
        UnprocessableEntityException
      );

      expect(sessionsService.createMany).not.toHaveBeenCalled();
      expect(instrumentRecordModel.createMany).not.toHaveBeenCalled();
    });

    it('should look the group up with the caller ability before writing anything', async () => {
      const ability = createAppAbility([{ action: 'create', subject: 'InstrumentRecord' }]);
      usersService.findByUsername.mockResolvedValueOnce({ groups: [{ id: 'group-1' }] });

      await instrumentRecordsService.upload(
        { ...baseUploadData, groupId: 'group-1', username: 'validuser' },
        { ability }
      );

      expect(groupsService.findById).toHaveBeenCalledWith('group-1', { ability });
    });

    it('should reject a series instrument, since only its scalar items hold records', async () => {
      instrumentsService.findById.mockResolvedValue({ ...mockInstrument, kind: 'SERIES' });

      await expect(instrumentRecordsService.upload({ ...baseUploadData })).rejects.toBeInstanceOf(
        UnprocessableEntityException
      );

      expect(sessionsService.createMany).not.toHaveBeenCalled();
    });

    it('should let an administrator upload without a group, creating ungrouped sessions', async () => {
      usersService.findByUsername.mockResolvedValueOnce({ basePermissionLevel: 'ADMIN', groups: [] });

      await instrumentRecordsService.upload({ ...baseUploadData, username: 'admin' });

      expect(sessionsService.createMany).toHaveBeenCalledWith(
        expect.objectContaining({ groupId: null, username: 'admin' }),
        undefined
      );
    });

    it('should store the computed measures of each record when the instrument defines measures', async () => {
      const measures = { score: { kind: 'computed', label: 'Score', value: () => 1 } };
      instrumentsService.findById.mockResolvedValue({ ...mockInstrument, measures });
      instrumentMeasuresService.computeMeasures.mockReturnValueOnce({ score: 1 });

      await instrumentRecordsService.upload({ ...baseUploadData });

      expect(instrumentMeasuresService.computeMeasures).toHaveBeenCalledWith(measures, { answer: 1 });
      expect(instrumentRecordModel.createMany.mock.lastCall?.[0]).toMatchObject({
        data: [{ computedMeasures: { score: 1 } }]
      });
    });

    it('should create records via createMany with the processed record data', async () => {
      await instrumentRecordsService.upload({ ...baseUploadData });

      expect(instrumentRecordModel.createMany).toHaveBeenCalledWith({
        data: [expect.objectContaining({ instrumentId: 'instrument-1', subjectId: 'subject-1' })]
      });
    });
  });

  describe('find', () => {
    beforeEach(() => {
      instrumentsService.find.mockResolvedValue([]);
      instrumentRecordModel.findMany.mockResolvedValue([]);
      sessionModel.findMany.mockResolvedValue([]);
    });

    it('should match records where the pending field is missing entirely, since prisma NOT filters on mongodb exclude documents without the field', async () => {
      await instrumentRecordsService.find({});

      expect(instrumentRecordModel.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            AND: expect.arrayContaining([
              { OR: [{ pending: { isSet: false } }, { pending: null }, { pending: false }] }
            ])
          }
        })
      );
    });

    it('should verify the requested group and instrument exist before querying records', async () => {
      await instrumentRecordsService.find({ groupId: 'group-1', instrumentId: 'instrument-1' });

      expect(groupsService.findById).toHaveBeenCalledWith('group-1');
      expect(instrumentsService.findById).toHaveBeenCalledWith('instrument-1');
      expect(groupsService.findById).toHaveBeenCalledBefore(instrumentRecordModel.findMany);
    });

    it('should restrict the records to instruments of the requested kind', async () => {
      instrumentsService.find.mockResolvedValueOnce([{ id: 'form-1' }, { id: 'form-2' }]);

      await instrumentRecordsService.find({ kind: 'FORM' });

      expect(instrumentsService.find).toHaveBeenCalledWith({ kind: 'FORM' });
      expect(instrumentRecordModel.findMany.mock.lastCall?.[0].where.AND).toContainEqual({
        instrumentId: { in: ['form-1', 'form-2'] }
      });
    });

    it('should not join the instrument, whose bundle is large and unused here', async () => {
      await instrumentRecordsService.find({});

      expect(instrumentRecordModel.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          include: expect.objectContaining({ instrument: false })
        })
      );
    });

    it("should label each record with its session user's username", async () => {
      instrumentRecordModel.findMany.mockResolvedValueOnce([
        { id: 'record-1', sessionId: 'session-1' },
        { id: 'record-2', sessionId: 'session-2' }
      ]);
      sessionModel.findMany.mockResolvedValueOnce([
        { id: 'session-1', user: { username: 'alice' } },
        { id: 'session-2', user: null }
      ]);

      const records = await instrumentRecordsService.find({ subjectId: 'subject-1' });

      expect(records[0]).toMatchObject({ session: { user: { username: 'alice' } } });
      expect(records[1]).toMatchObject({ session: { user: { username: null } } });
    });

    // Only the per-subject datahub view renders the username column; /dashboard fetches every record
    // in the group and reads instrumentId alone, so labelling there is a second query for nothing.
    it('should not look up sessions when no subject is given, so the dashboard does not pay for it', async () => {
      instrumentRecordModel.findMany.mockResolvedValueOnce([{ id: 'record-1', sessionId: 'session-1' }]);

      const records = await instrumentRecordsService.find({ groupId: 'group-1' });

      expect(sessionModel.findMany).not.toHaveBeenCalled();
      expect(records[0]).not.toHaveProperty('session');
    });

    it('should look up only the sessions the returned records reference, deduplicated', async () => {
      instrumentRecordModel.findMany.mockResolvedValueOnce([
        { id: 'record-1', sessionId: 'session-1' },
        { id: 'record-2', sessionId: 'session-1' },
        { id: 'record-3', sessionId: 'session-2' }
      ]);
      sessionModel.findMany.mockResolvedValueOnce([]);

      await instrumentRecordsService.find({ subjectId: 'subject-1' });

      expect(sessionModel.findMany).toHaveBeenCalledWith({
        select: { id: true, user: { select: { username: true } } },
        where: { AND: [{}, { id: { in: ['session-1', 'session-2'] } }] }
      });
    });

    it('should scope the session lookup to the sessions the caller may read, so a readable record referencing an unreadable session leaks no username', async () => {
      const ability = createAppAbility([
        { action: 'read', conditions: { groupId: 'group-1' }, subject: 'InstrumentRecord' },
        { action: 'read', conditions: { groupId: 'group-1' }, subject: 'Session' }
      ]);
      instrumentRecordModel.findMany.mockResolvedValueOnce([{ id: 'record-1', sessionId: 'session-1' }]);
      sessionModel.findMany.mockResolvedValueOnce([]);

      await instrumentRecordsService.find({ subjectId: 'subject-1' }, { ability });

      expect(sessionModel.findMany).toHaveBeenCalledWith({
        select: { id: true, user: { select: { username: true } } },
        where: { AND: [accessibleQuery(ability, 'read', 'Session'), { id: { in: ['session-1'] } }] }
      });
    });

    it('should not query sessions at all when there are no records', async () => {
      instrumentRecordModel.findMany.mockResolvedValueOnce([]);

      await instrumentRecordsService.find({ subjectId: 'subject-1' });

      expect(sessionModel.findMany).not.toHaveBeenCalled();
    });

    // A record whose session has been deleted must not take down the whole request. An `include` on
    // the relation would, since `session` is declared required in the prisma schema.
    it('should return a record whose session no longer exists, with no username', async () => {
      instrumentRecordModel.findMany.mockResolvedValueOnce([{ id: 'record-1', sessionId: 'deleted-session' }]);
      sessionModel.findMany.mockResolvedValueOnce([]);

      const records = await instrumentRecordsService.find({ subjectId: 'subject-1' });

      expect(records).toHaveLength(1);
      expect(records[0]).toMatchObject({ id: 'record-1', session: { user: { username: null } } });
    });
  });

  describe('exportRecords', () => {
    it('should return an array of export records with correct shape', async () => {
      const mockRecords = [
        {
          computedMeasures: { score: 85 },
          date: '2023-01-01',
          groupId: '123',
          id: 'record-1',
          instrumentId: 'instrument-1',
          session: {
            date: '2023-01-01',
            id: 'session-1',
            type: 'IN_PERSON' as const,
            user: { username: 'testuser' }
          },
          subject: {
            age: 20,
            groupIds: ['group-1'],
            id: 'subject-1',
            sex: 'MALE' as const
          }
        }
      ] satisfies RecordType[];

      const mockInstruments = [
        {
          id: 'instrument-1',
          internal: { edition: 1, name: 'Test Instrument' }
        }
      ];

      instrumentRecordModel.aggregateRaw.mockResolvedValueOnce(mockRecords);
      instrumentsService.findById.mockResolvedValueOnce(mockInstruments[0]);

      const ability = { can: () => true } as any;

      const result = await instrumentRecordsService.exportRecords({}, { ability });

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
      expect(result[0]).toMatchObject({
        groupId: '123',
        instrumentEdition: 1,
        instrumentName: 'Test Instrument',
        measure: 'score',
        sessionId: 'session-1',
        sessionType: 'IN_PERSON',
        subjectId: expect.any(String),
        timestamp: expect.any(String),
        username: 'testuser',
        value: 85
      });
    });

    describe('with the ability built at login', () => {
      /**
       * A raw aggregate row for one subject enrolled in both groups, so only the record's own
       * `groupId` (null for a record collected outside any group) can tell the rows apart.
       */
      const exportRow = (groupId: null | string) => ({
        computedMeasures: { score: 85 },
        date: '2023-01-01',
        groupId,
        id: `record-${groupId}`,
        instrumentId: 'instrument-1',
        session: {
          date: '2023-01-01',
          id: `session-${groupId}`,
          type: 'IN_PERSON' as const,
          user: { username: 'testuser' }
        },
        subject: { age: 20, groupIds: ['group-1', 'group-2'], id: 'subject-1', sex: 'MALE' }
      });

      const abilityAt = (basePermissionLevel: 'ADMIN' | 'GROUP_MANAGER') =>
        new AbilityFactory(MockFactory.createMock(LoggingService) as unknown as LoggingService).createForPayload({
          additionalPermissions: undefined,
          basePermissionLevel,
          firstName: 'Test',
          groups: [{ id: 'group-1' }],
          id: 'user-1',
          lastName: 'User',
          username: 'test-user'
        } as any);

      const exportedGroupIds = async (
        rows: ReturnType<typeof exportRow>[],
        basePermissionLevel: 'ADMIN' | 'GROUP_MANAGER'
      ) => {
        instrumentRecordModel.aggregateRaw.mockResolvedValueOnce(rows);
        instrumentsService.findById.mockResolvedValue({ id: 'instrument-1', internal: { edition: 1, name: 'Test' } });
        const result = await instrumentRecordsService.exportRecords({}, { ability: abilityAt(basePermissionLevel) });
        return result.map((entry) => entry.groupId);
      };

      it("should export a group manager's own group and no other, even for a subject shared with another, since each raw row is checked as an instrument record", async () => {
        const rows = [exportRow('group-1'), exportRow('group-2')];
        expect(await exportedGroupIds(rows, 'GROUP_MANAGER')).toStrictEqual(['group-1']);
      });

      it("should leave records collected outside any group out of a group manager's export, even for a subject in their group, as the record list does", async () => {
        const rows = [exportRow('group-1'), exportRow(null)];
        expect(await exportedGroupIds(rows, 'GROUP_MANAGER')).toStrictEqual(['group-1']);
      });

      it('should export every group and the records collected outside any group to an administrator, labelling the latter root', async () => {
        const rows = [exportRow('group-1'), exportRow('group-2'), exportRow(null)];
        expect(await exportedGroupIds(rows, 'ADMIN')).toStrictEqual(['group-1', 'group-2', DEFAULT_GROUP_NAME]);
      });
    });

    it('should join and project the session user by a cast-hardened lookup, so the export includes the username of whoever ran the session', async () => {
      instrumentRecordModel.aggregateRaw.mockResolvedValueOnce([]);
      const ability = { can: () => true } as any;

      await instrumentRecordsService.exportRecords({}, { ability });

      const [{ pipeline }] = instrumentRecordModel.aggregateRaw.mock.lastCall as [{ pipeline: any[] }];

      // Session documents only ever store a userId reference, never an embedded user object, so
      // resolving a username requires an explicit join against UserModel.
      const userLookupStage = pipeline.find((stage) => stage.$lookup?.from === 'UserModel');
      expect(userLookupStage).toBeDefined();

      const projectStage = pipeline.find((stage) => stage.$project);
      expect(projectStage.$project.session.user.username).toBe('$sessionUser.username');
    });

    it('should match only the requested group in the aggregation, so a scoped export reads no other group', async () => {
      instrumentRecordModel.aggregateRaw.mockResolvedValueOnce([]);

      await instrumentRecordsService.exportRecords({ groupId: 'group-1' }, { ability: createAppAbility([]) });

      const [{ pipeline }] = instrumentRecordModel.aggregateRaw.mock.lastCall as [{ pipeline: any[] }];
      const matchStage = pipeline.find((stage) => stage.$match);
      expect(matchStage.$match.$expr).toStrictEqual({ $eq: ['$groupId', { $toObjectId: 'group-1' }] });
    });

    describe('when the worker fails', () => {
      const record = {
        computedMeasures: { score: 85 },
        date: '2023-01-01',
        groupId: 'group-1',
        id: 'record-1',
        instrumentId: 'instrument-1',
        session: { date: '2023-01-01', id: 'session-1', type: 'IN_PERSON' as const, user: null },
        subject: { age: 20, groupIds: ['group-1'], id: 'subject-1', sex: 'MALE' }
      } satisfies RecordType;
      const ability = createAppAbility([{ action: 'manage', subject: 'all' }]);

      beforeEach(() => {
        instrumentRecordModel.aggregateRaw.mockResolvedValueOnce([record]);
      });

      it('should reject with the error the worker reports for a chunk', async () => {
        instrumentsService.findById.mockResolvedValueOnce({
          id: 'other-instrument',
          internal: { edition: 1, name: 'X' }
        });

        await expect(instrumentRecordsService.exportRecords({}, { ability })).rejects.toThrow(
          'Instrument not found for ID: instrument-1'
        );
      });

      it('should reject and terminate the worker when it crashes', async () => {
        instrumentsService.findById.mockResolvedValueOnce({ id: 'instrument-1', internal: { edition: 1, name: 'X' } });
        const worker = useFakeWorker();
        const error = new Error('worker crashed');

        const result = instrumentRecordsService.exportRecords({}, { ability });
        await vi.waitFor(() => expect(worker.postMessage).toHaveBeenCalledOnce());
        worker.emit('error', error);

        await expect(result).rejects.toBe(error);
        expect(worker.terminate).toHaveBeenCalledOnce();
      });
    });
  });

  describe('count', () => {
    it('should count only the records the caller may read that match the filter', async () => {
      const ability = createAppAbility([
        { action: 'read', conditions: { groupId: 'group-1' }, subject: 'InstrumentRecord' }
      ]);
      instrumentRecordModel.count.mockResolvedValueOnce(3);

      await expect(instrumentRecordsService.count({ subjectId: 'subject-1' }, { ability })).resolves.toBe(3);

      expect(instrumentRecordModel.count).toHaveBeenCalledWith({
        where: { AND: [accessibleQuery(ability, 'read', 'InstrumentRecord'), { subjectId: 'subject-1' }] }
      });
    });

    it('should count every record when given no filter or ability', async () => {
      instrumentRecordModel.count.mockResolvedValueOnce(7);

      await expect(instrumentRecordsService.count()).resolves.toBe(7);

      expect(instrumentRecordModel.count).toHaveBeenCalledWith({ where: { AND: [{}, {}] } });
    });
  });

  describe('exists', () => {
    it('should report whether a record matches the given filter', async () => {
      instrumentRecordModel.exists.mockResolvedValueOnce(true);

      await expect(instrumentRecordsService.exists({ id: 'record-1' })).resolves.toBe(true);

      expect(instrumentRecordModel.exists).toHaveBeenCalledWith({ id: 'record-1' });
    });
  });

  describe('linearModel', () => {
    const measures = { score: { kind: 'computed', label: 'Score', value: () => 1 } };
    const recordAt = (time: number, computedMeasures: { [key: string]: unknown }) => ({
      computedMeasures,
      date: new Date(time)
    });

    const useInstrument = (instance: object) => {
      instrumentsService.findById.mockResolvedValueOnce({ bundle: '', id: 'instrument-1' });
      instrumentsService.getInstrumentInstance.mockResolvedValueOnce({ id: 'instrument-1', ...instance });
    };

    it('should verify the requested group exists before building the model', async () => {
      useInstrument({ kind: 'FORM', measures: null });

      await instrumentRecordsService.linearModel({ groupId: 'group-1', instrumentId: 'instrument-1' });

      expect(groupsService.findById).toHaveBeenCalledWith('group-1');
    });

    it('should evaluate the stored instrument, since its measures live in the bundle', async () => {
      const stored = { bundle: 'bundle', id: 'instrument-1' };
      instrumentsService.findById.mockResolvedValueOnce(stored);
      instrumentsService.getInstrumentInstance.mockResolvedValueOnce({ kind: 'FORM', measures: null });

      await instrumentRecordsService.linearModel({ instrumentId: 'instrument-1' });

      expect(instrumentsService.getInstrumentInstance).toHaveBeenCalledWith(stored);
    });

    it('should reject a series instrument, which has no measures of its own', async () => {
      useInstrument({ kind: 'SERIES' });

      await expect(instrumentRecordsService.linearModel({ instrumentId: 'instrument-1' })).rejects.toBeInstanceOf(
        UnprocessableEntityException
      );
    });

    it('should return no results without querying records when the instrument has no measures', async () => {
      useInstrument({ kind: 'FORM', measures: null });

      await expect(instrumentRecordsService.linearModel({ instrumentId: 'instrument-1' })).resolves.toStrictEqual({});

      expect(instrumentRecordModel.findMany).not.toHaveBeenCalled();
    });

    it('should query only the readable records of the instrument and group', async () => {
      const ability = createAppAbility([
        { action: 'read', conditions: { groupId: 'group-1' }, subject: 'InstrumentRecord' }
      ]);
      useInstrument({ kind: 'FORM', measures });
      instrumentRecordModel.findMany.mockResolvedValueOnce([]);

      await instrumentRecordsService.linearModel({ groupId: 'group-1', instrumentId: 'instrument-1' }, { ability });

      expect(instrumentRecordModel.findMany).toHaveBeenCalledWith({
        include: { instrument: true },
        where: {
          AND: [
            accessibleQuery(ability, 'read', 'InstrumentRecord'),
            { groupId: 'group-1' },
            { instrumentId: 'instrument-1' }
          ]
        }
      });
    });

    it('should return no results for fewer than three records, too few to fit a line', async () => {
      useInstrument({ kind: 'FORM', measures });
      instrumentRecordModel.findMany.mockResolvedValueOnce([recordAt(1, { score: 1 }), recordAt(2, { score: 2 })]);

      await expect(instrumentRecordsService.linearModel({ instrumentId: 'instrument-1' })).resolves.toStrictEqual({});
    });

    it('should fit each numeric measure against the record date, ignoring non-numeric measures', async () => {
      useInstrument({ kind: 'FORM', measures });
      instrumentRecordModel.findMany.mockResolvedValueOnce([
        recordAt(1, { label: 'a', score: 2 }),
        recordAt(2, { label: 'b', score: 4 }),
        recordAt(3, { label: 'c', score: 6 })
      ]);

      const results = await instrumentRecordsService.linearModel({ instrumentId: 'instrument-1' });

      expect(Object.keys(results)).toStrictEqual(['score']);
      expect(results.score!.slope).toBeCloseTo(2);
      expect(results.score!.intercept).toBeCloseTo(0);
    });
  });

  describe('updateById', () => {
    const useRecord = (data: unknown) => {
      instrumentRecordModel.findFirst.mockResolvedValueOnce({ data, id: 'record-1', instrumentId: 'instrument-1' });
    };

    const useInstrument = (instance: object = {}) => {
      instrumentsService.findById.mockResolvedValueOnce({ bundle: '', id: 'instrument-1' });
      instrumentsService.getInstrumentInstance.mockResolvedValueOnce({
        measures: null,
        validationSchema: { safeParseAsync: (data: unknown) => Promise.resolve({ data, success: true }) },
        ...instance
      });
    };

    beforeEach(() => {
      instrumentRecordModel.update.mockResolvedValue({ id: 'record-1' });
    });

    it('should throw a NotFoundException when the record does not exist', async () => {
      instrumentRecordModel.findFirst.mockResolvedValueOnce(null);

      await expect(instrumentRecordsService.updateById('record-1', {})).rejects.toBeInstanceOf(NotFoundException);

      expect(instrumentRecordModel.update).not.toHaveBeenCalled();
    });

    it('should reject an object update to a record whose data is an array', async () => {
      useRecord([{ answer: 1 }]);

      await expect(instrumentRecordsService.updateById('record-1', { answer: 2 })).rejects.toBeInstanceOf(
        BadRequestException
      );

      expect(instrumentRecordModel.update).not.toHaveBeenCalled();
    });

    it('should merge the update into the existing data, keeping fields it does not mention', async () => {
      useRecord({ answer: 1, comment: 'kept' });
      useInstrument();

      await instrumentRecordsService.updateById('record-1', { answer: 2 });

      expect(instrumentRecordModel.update.mock.lastCall?.[0]).toMatchObject({
        data: { computedMeasures: null, data: { answer: 2, comment: 'kept' } }
      });
    });

    // Pins a reported defect: a submitted array is silently dropped. Expected to change when the source is fixed.
    it('should ignore an array the update supplies for an existing array field', async () => {
      useRecord({ answers: [1, 2, 3] });
      useInstrument();

      await instrumentRecordsService.updateById('record-1', { answers: [9] });

      expect(instrumentRecordModel.update.mock.lastCall?.[0]).toMatchObject({ data: { data: { answers: [1, 2, 3] } } });
    });

    it('should merge an array update element by element into array data', async () => {
      useRecord([{ answer: 1, comment: 'kept' }]);
      useInstrument();

      await instrumentRecordsService.updateById('record-1', [{ answer: 2 }]);

      expect(instrumentRecordModel.update.mock.lastCall?.[0]).toMatchObject({
        data: { data: [{ answer: 2, comment: 'kept' }] }
      });
    });

    it('should reject merged data that no longer matches the instrument schema', async () => {
      const issues = [{ message: 'Expected number', path: ['answer'] }];
      useRecord({ answer: 1 });
      useInstrument({
        validationSchema: { safeParseAsync: () => Promise.resolve({ error: { issues }, success: false }) }
      });

      await expect(instrumentRecordsService.updateById('record-1', { answer: 'x' })).rejects.toMatchObject({
        response: { issues, message: 'Merged data does not match validation schema' }
      });
      expect(instrumentRecordModel.update).not.toHaveBeenCalled();
    });

    it('should recompute the measures from the merged data', async () => {
      const measures = { score: { kind: 'computed', label: 'Score', value: () => 1 } };
      useRecord({ answer: 1 });
      useInstrument({ measures });
      instrumentMeasuresService.computeMeasures.mockReturnValueOnce({ score: 2 });

      await instrumentRecordsService.updateById('record-1', { answer: 2 });

      expect(instrumentMeasuresService.computeMeasures).toHaveBeenCalledWith(measures, { answer: 2 });
      expect(instrumentRecordModel.update.mock.lastCall?.[0]).toMatchObject({
        data: { computedMeasures: { score: 2 } }
      });
    });

    // Pins a reported defect: the PATCH route is gated on update, but the write is scoped by delete rules.
    // Expected to change when the source is fixed.
    it("should scope the write by the caller's delete rules", async () => {
      const ability = createAppAbility([
        { action: 'delete', conditions: { groupId: 'group-1' }, subject: 'InstrumentRecord' }
      ]);
      useRecord({ answer: 1 });
      useInstrument();

      await instrumentRecordsService.updateById('record-1', { answer: 2 }, { ability });

      expect(instrumentRecordModel.update.mock.lastCall?.[0].where).toStrictEqual({
        AND: [accessibleQuery(ability, 'delete', 'InstrumentRecord')],
        id: 'record-1'
      });
    });
  });
});
