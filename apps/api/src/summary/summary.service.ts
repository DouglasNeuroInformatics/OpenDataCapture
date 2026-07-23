import { Injectable } from '@nestjs/common';
import type { Summary } from '@opendatacapture/schemas/summary';

import type { EntityOperationOptions } from '@/core/types';
import { InstrumentRecordsService } from '@/instrument-records/instrument-records.service';
import { InstrumentsService } from '@/instruments/instruments.service';
import { SessionsService } from '@/sessions/sessions.service';
import { SubjectsService } from '@/subjects/subjects.service';
import { UsersService } from '@/users/users.service';

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;
const TREND_POINT_COUNT = 5;

@Injectable()
export class SummaryService {
  constructor(
    private readonly instrumentRecordsService: InstrumentRecordsService,
    private readonly instrumentsService: InstrumentsService,
    private readonly sessionsService: SessionsService,
    private readonly usersService: UsersService,
    private readonly subjectsService: SubjectsService
  ) {}

  async getSummary(groupId?: string, { ability }: EntityOperationOptions = {}): Promise<Summary> {
    const filter = groupId ? { groupIds: { has: groupId } } : ({} as { [key: string]: unknown });
    const sessionFilter = groupId ? { groupId } : {};
    const recordFilter = groupId ? { groupId } : {};

    const now = Date.now();
    const timestamps = Array.from({ length: TREND_POINT_COUNT }, (_, i) => now - THIRTY_DAYS_MS * i);

    const countTrend = (countAsOf: (lte: Date) => Promise<number>): Promise<Summary['trends']['records']> =>
      Promise.all(timestamps.map(async (timestamp) => ({ timestamp, value: await countAsOf(new Date(timestamp)) })));

    // None of these counts depend on one another, so they are issued concurrently: the endpoint costs
    // the slowest query rather than the sum of all of them.
    const [instruments, records, sessions, subjects, users, recordTrend, sessionTrend, subjectTrend] =
      await Promise.all([
        this.instrumentsService.count(),
        this.instrumentRecordsService.count(recordFilter, { ability }),
        this.sessionsService.count(sessionFilter, { ability }),
        this.subjectsService.count(filter, { ability }),
        this.usersService.count(filter, { ability }),
        countTrend((lte) => this.instrumentRecordsService.count({ date: { lte }, ...recordFilter }, { ability })),
        countTrend((lte) => this.sessionsService.count({ date: { lte }, ...sessionFilter }, { ability })),
        countTrend((lte) => this.subjectsService.count({ createdAt: { lte }, ...filter }, { ability }))
      ]);

    return {
      counts: { instruments, records, sessions, subjects, users },
      trends: { records: recordTrend, sessions: sessionTrend, subjects: subjectTrend }
    };
  }
}
