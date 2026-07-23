import type { Model } from '@douglasneuroinformatics/libnest';
import { getModelToken } from '@douglasneuroinformatics/libnest';
import { MockFactory } from '@douglasneuroinformatics/libnest/testing';
import type { MockedInstance } from '@douglasneuroinformatics/libnest/testing';
import { ForbiddenException, NotFoundException, UnprocessableEntityException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { beforeEach, describe, expect, it } from 'vitest';

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

describe('InstrumentRecordsService', () => {
  let instrumentRecordsService: InstrumentRecordsService;
  let instrumentRecordModel: MockedInstance<Model<'InstrumentRecord'>>;
  let sessionModel: MockedInstance<Model<'Session'>>;
  let instrumentsService: MockedInstance<InstrumentsService>;
  let sessionsService: MockedInstance<SessionsService>;
  let subjectsService: MockedInstance<SubjectsService>;
  let usersService: MockedInstance<UsersService>;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        InstrumentRecordsService,
        MockFactory.createForModelToken(getModelToken('InstrumentRecord')),
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

    instrumentRecordModel = moduleRef.get(getModelToken('InstrumentRecord'));
    sessionModel = moduleRef.get(getModelToken('Session'));
    instrumentRecordsService = moduleRef.get(InstrumentRecordsService);
    instrumentsService = moduleRef.get(InstrumentsService);
    sessionsService = moduleRef.get(SessionsService);
    subjectsService = moduleRef.get(SubjectsService);
    usersService = moduleRef.get(UsersService);
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
      sessionsService.create.mockResolvedValue(mockSession as any);
      sessionsService.deleteByIds.mockResolvedValue(undefined as any);
      instrumentRecordModel.createMany.mockResolvedValue([] as any);
      instrumentRecordModel.findMany.mockResolvedValue([] as any);
    });

    it('should call sessionsService.create with the provided username', async () => {
      usersService.findByUsername.mockResolvedValueOnce({ groups: [{ id: 'group-1' }], username: 'validuser' } as any);

      await instrumentRecordsService.upload({ ...baseUploadData, groupId: 'group-1', username: 'validuser' });

      expect(usersService.findByUsername).toHaveBeenCalledWith('validuser', undefined);
      expect(sessionsService.create).toHaveBeenCalledWith(expect.objectContaining({ username: 'validuser' }));
    });

    it('should throw a ForbiddenException when a non-admin user uploads without a group', async () => {
      usersService.findByUsername.mockResolvedValueOnce({
        basePermissionLevel: 'STANDARD',
        username: 'validuser'
      } as any);

      await expect(
        instrumentRecordsService.upload({ ...baseUploadData, username: 'validuser' })
      ).rejects.toBeInstanceOf(ForbiddenException);

      expect(sessionsService.create).not.toHaveBeenCalled();
    });

    it('should throw a ForbiddenException when a user uploads to a group they are not a member of', async () => {
      usersService.findByUsername.mockResolvedValueOnce({
        groups: [{ id: 'other-group' }],
        username: 'validuser'
      } as any);

      await expect(
        instrumentRecordsService.upload({ ...baseUploadData, groupId: 'group-1', username: 'validuser' })
      ).rejects.toBeInstanceOf(ForbiddenException);

      expect(sessionsService.create).not.toHaveBeenCalled();
    });

    it('should reject and not create any sessions when an unknown username is provided', async () => {
      usersService.findByUsername.mockRejectedValueOnce(
        new NotFoundException('Failed to find user with username: spoofed')
      );

      await expect(instrumentRecordsService.upload({ ...baseUploadData, username: 'spoofed' })).rejects.toBeInstanceOf(
        NotFoundException
      );

      expect(sessionsService.create).not.toHaveBeenCalled();
    });

    it('should call sessionsService.create with username undefined when no username is provided', async () => {
      await instrumentRecordsService.upload({ ...baseUploadData });

      expect(usersService.findByUsername).not.toHaveBeenCalled();
      expect(sessionsService.create).toHaveBeenCalledWith(expect.objectContaining({ username: undefined }));
    });

    // `pending` is intentionally not written on create; the find-side OR filter treats missing and
    // false `pending` alike (see the 'find' describe block), so records stay query-visible without it.
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

      const records = await instrumentRecordsService.find({});

      expect(records[0]).toMatchObject({ session: { user: { username: 'alice' } } });
      expect(records[1]).toMatchObject({ session: { user: { username: null } } });
    });

    it('should look up only the sessions the returned records reference, deduplicated', async () => {
      instrumentRecordModel.findMany.mockResolvedValueOnce([
        { id: 'record-1', sessionId: 'session-1' },
        { id: 'record-2', sessionId: 'session-1' },
        { id: 'record-3', sessionId: 'session-2' }
      ]);
      sessionModel.findMany.mockResolvedValueOnce([]);

      await instrumentRecordsService.find({});

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

      await instrumentRecordsService.find({}, { ability });

      expect(sessionModel.findMany).toHaveBeenCalledWith({
        select: { id: true, user: { select: { username: true } } },
        where: { AND: [accessibleQuery(ability, 'read', 'Session'), { id: { in: ['session-1'] } }] }
      });
    });

    it('should not query sessions at all when there are no records', async () => {
      instrumentRecordModel.findMany.mockResolvedValueOnce([]);

      await instrumentRecordsService.find({});

      expect(sessionModel.findMany).not.toHaveBeenCalled();
    });

    // A record whose session has been deleted must not take down the whole request. An `include` on
    // the relation would, since `session` is declared required in the prisma schema.
    it('should return a record whose session no longer exists, with no username', async () => {
      instrumentRecordModel.findMany.mockResolvedValueOnce([{ id: 'record-1', sessionId: 'deleted-session' }]);
      sessionModel.findMany.mockResolvedValueOnce([]);

      const records = await instrumentRecordsService.find({});

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
  });
});
