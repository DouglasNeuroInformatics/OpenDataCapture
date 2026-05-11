import type { Model } from '@douglasneuroinformatics/libnest';
import { getModelToken } from '@douglasneuroinformatics/libnest';
import { MockFactory } from '@douglasneuroinformatics/libnest/testing';
import type { MockedInstance } from '@douglasneuroinformatics/libnest/testing';
import { NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { beforeEach, describe, expect, it } from 'vitest';

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
  let instrumentsService: MockedInstance<InstrumentsService>;
  let sessionsService: MockedInstance<SessionsService>;
  let subjectsService: MockedInstance<SubjectsService>;
  let usersService: MockedInstance<UsersService>;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        InstrumentRecordsService,
        MockFactory.createForModelToken(getModelToken('InstrumentRecord')),
        MockFactory.createForService(GroupsService),
        MockFactory.createForService(UsersService),
        MockFactory.createForService(InstrumentMeasuresService),
        MockFactory.createForService(InstrumentsService),
        MockFactory.createForService(SessionsService),
        MockFactory.createForService(SubjectsService)
      ]
    }).compile();

    instrumentRecordModel = moduleRef.get(getModelToken('InstrumentRecord'));
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
