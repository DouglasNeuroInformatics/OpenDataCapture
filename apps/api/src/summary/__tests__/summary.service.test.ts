import { MockFactory } from '@douglasneuroinformatics/libnest/testing';
import type { MockedInstance } from '@douglasneuroinformatics/libnest/testing';
import { Test } from '@nestjs/testing';
import { beforeEach, describe, expect, it } from 'vitest';

import { InstrumentRecordsService } from '@/instrument-records/instrument-records.service';
import { InstrumentsService } from '@/instruments/instruments.service';
import { SessionsService } from '@/sessions/sessions.service';
import { SubjectsService } from '@/subjects/subjects.service';
import { UsersService } from '@/users/users.service';

import { SummaryService } from '../summary.service';

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

describe('SummaryService', () => {
  let summaryService: SummaryService;
  let instrumentRecordsService: MockedInstance<InstrumentRecordsService>;
  let instrumentsService: MockedInstance<InstrumentsService>;
  let sessionsService: MockedInstance<SessionsService>;
  let subjectsService: MockedInstance<SubjectsService>;
  let usersService: MockedInstance<UsersService>;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        SummaryService,
        MockFactory.createForService(InstrumentRecordsService),
        MockFactory.createForService(InstrumentsService),
        MockFactory.createForService(SessionsService),
        MockFactory.createForService(SubjectsService),
        MockFactory.createForService(UsersService)
      ]
    }).compile();

    summaryService = moduleRef.get(SummaryService);
    instrumentRecordsService = moduleRef.get(InstrumentRecordsService);
    instrumentsService = moduleRef.get(InstrumentsService);
    sessionsService = moduleRef.get(SessionsService);
    subjectsService = moduleRef.get(SubjectsService);
    usersService = moduleRef.get(UsersService);

    for (const service of [
      instrumentRecordsService,
      instrumentsService,
      sessionsService,
      subjectsService,
      usersService
    ]) {
      service.count.mockResolvedValue(0);
    }
  });

  describe('getSummary', () => {
    it('should return the count from each service', async () => {
      instrumentsService.count.mockResolvedValue(1);
      instrumentRecordsService.count.mockResolvedValue(2);
      sessionsService.count.mockResolvedValue(3);
      subjectsService.count.mockResolvedValue(4);
      usersService.count.mockResolvedValue(5);
      const { counts } = await summaryService.getSummary();
      expect(counts).toStrictEqual({ instruments: 1, records: 2, sessions: 3, subjects: 4, users: 5 });
    });

    it('should return five trend points per metric, spaced thirty days apart and ordered most recent first', async () => {
      const { trends } = await summaryService.getSummary();
      for (const trend of [trends.records, trends.sessions, trends.subjects]) {
        expect(trend).toHaveLength(5);
        for (let i = 1; i < trend.length; i++) {
          expect(trend[i - 1]!.timestamp - trend[i]!.timestamp).toBe(THIRTY_DAYS_MS);
        }
      }
    });

    it('should pair each trend value with its own timestamp', async () => {
      // Resolve each count to the `lte` it was queried with, so a value that has drifted onto the
      // wrong timestamp is visible in the result rather than hidden behind identical counts.
      sessionsService.count.mockImplementation((where: { date?: { lte: Date } }) =>
        Promise.resolve(where.date ? where.date.lte.getTime() : 0)
      );
      const { trends } = await summaryService.getSummary();
      for (const point of trends.sessions) {
        expect(point.value).toBe(point.timestamp);
      }
    });

    it('should use a single clock reading for every metric', async () => {
      const { trends } = await summaryService.getSummary();
      expect(trends.sessions.map((point) => point.timestamp)).toStrictEqual(
        trends.records.map((point) => point.timestamp)
      );
      expect(trends.subjects.map((point) => point.timestamp)).toStrictEqual(
        trends.records.map((point) => point.timestamp)
      );
    });

    it('should scope every query to the group when a groupId is provided', async () => {
      await summaryService.getSummary('group-1');
      expect(instrumentRecordsService.count).toHaveBeenCalledWith(
        expect.objectContaining({ groupId: 'group-1' }),
        expect.anything()
      );
      expect(sessionsService.count).toHaveBeenCalledWith(
        expect.objectContaining({ groupId: 'group-1' }),
        expect.anything()
      );
      for (const service of [subjectsService, usersService]) {
        expect(service.count).toHaveBeenCalledWith(
          expect.objectContaining({ groupIds: { has: 'group-1' } }),
          expect.anything()
        );
      }
    });

    it('should issue every query concurrently rather than awaiting them in sequence', async () => {
      // Hold every count open until all of them have been called. If any query waits on the result
      // of another, the expected number is never reached and this test times out.
      const EXPECTED_QUERIES = 20;
      let started = 0;
      let allStarted: () => void;
      const gate = new Promise<void>((resolve) => {
        allStarted = resolve;
      });
      for (const service of [
        instrumentRecordsService,
        instrumentsService,
        sessionsService,
        subjectsService,
        usersService
      ]) {
        service.count.mockImplementation(async () => {
          if (++started === EXPECTED_QUERIES) {
            allStarted();
          }
          await gate;
          return 0;
        });
      }
      await summaryService.getSummary();
      expect(started).toBe(EXPECTED_QUERIES);
    });
  });
});
