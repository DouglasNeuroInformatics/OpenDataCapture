import type { Model } from '@douglasneuroinformatics/libnest';
import { getModelToken } from '@douglasneuroinformatics/libnest';
import { MockFactory } from '@douglasneuroinformatics/libnest/testing';
import type { MockedInstance } from '@douglasneuroinformatics/libnest/testing';
import { NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { beforeEach, describe, expect, it } from 'vitest';

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

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        InstrumentRecordsService,
        MockFactory.createForModelToken(getModelToken('InstrumentRecord')),
        MockFactory.createForService(GroupsService),
        MockFactory.createForService(InstrumentMeasuresService),
        MockFactory.createForService(InstrumentsService),
        MockFactory.createForService(SessionsService),
        MockFactory.createForService(SubjectsService)
      ]
    }).compile();

    instrumentRecordModel = moduleRef.get(getModelToken('InstrumentRecord'));
    instrumentRecordsService = moduleRef.get(InstrumentRecordsService);
    instrumentsService = moduleRef.get(InstrumentsService);
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
