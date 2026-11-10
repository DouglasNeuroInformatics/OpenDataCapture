import type { RequestUser } from '@douglasneuroinformatics/libnest';
import { Injectable } from '@nestjs/common';
import type { Summary, SummaryQueryParams, SummaryTrendWindow } from '@opendatacapture/schemas/summary';

import { InstrumentRecordsService } from '@/instrument-records/instrument-records.service';
import { InstrumentsService } from '@/instruments/instruments.service';
import { SessionsService } from '@/sessions/sessions.service';
import { SubjectsService } from '@/subjects/subjects.service';
import { UsersService } from '@/users/users.service';

type TrendStep = { days?: number; months?: number; years?: number };

type TrendSpacing = { count: number; step: TrendStep };

type CountAsOf = (lte: Date) => Promise<number>;

const TREND_SPACINGS: { [K in Exclude<SummaryTrendWindow, 'all'>]: TrendSpacing } = {
  default: { count: 5, step: { days: 30 } },
  past2Years: { count: 9, step: { months: 3 } },
  past3Months: { count: 4, step: { months: 1 } },
  past5Years: { count: 6, step: { years: 1 } },
  past6Months: { count: 7, step: { months: 1 } },
  pastMonth: { count: 5, step: { days: 7 } },
  pastYear: { count: 13, step: { months: 1 } }
};

/** The bounded windows, shortest first: `all` takes the first one that reaches back past every item. */
const BOUNDED_WINDOWS = ['pastMonth', 'past3Months', 'past6Months', 'pastYear', 'past2Years', 'past5Years'] as const;

/** The number of points `all` draws once the data is older than the longest bounded window. */
const ALL_TIME_POINT_COUNT = 6;

const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * Each point's timestamp, most recent first, stepping back from `now`. Days step by a fixed length,
 * so a daylight saving change cannot stretch them; months and years step by the calendar.
 */
function trendTimestamps(now: number, { count, step }: TrendSpacing): number[] {
  return Array.from({ length: count }, (_, i) => {
    const date = new Date(now - (step.days ?? 0) * i * DAY_MS);
    date.setFullYear(date.getFullYear() - (step.years ?? 0) * i, date.getMonth() - (step.months ?? 0) * i);
    return date.getTime();
  });
}

@Injectable()
export class SummaryService {
  constructor(
    private readonly instrumentRecordsService: InstrumentRecordsService,
    private readonly instrumentsService: InstrumentsService,
    private readonly sessionsService: SessionsService,
    private readonly usersService: UsersService,
    private readonly subjectsService: SubjectsService
  ) {}

  async getSummary(
    currentUser: RequestUser,
    { groupId, recordTrendWindow = 'default', subjectTrendWindow = 'default' }: Partial<SummaryQueryParams> = {}
  ): Promise<Summary> {
    const { ability } = currentUser;
    const filter = groupId ? { groupIds: { has: groupId } } : ({} as { [key: string]: unknown });
    const sessionFilter = groupId ? { groupId } : {};
    const recordFilter = groupId ? { groupId } : {};

    const countRecordsAsOf: CountAsOf = (lte) => {
      return this.instrumentRecordsService.count({ date: { lte }, ...recordFilter }, { ability });
    };
    const countSessionsAsOf: CountAsOf = (lte) => {
      return this.sessionsService.count({ date: { lte }, ...sessionFilter }, { ability });
    };
    const countSubjectsAsOf: CountAsOf = (lte) => {
      return this.subjectsService.count({ createdAt: { lte }, ...filter }, { ability });
    };

    const now = Date.now();
    const [recordTimestamps, subjectTimestamps] = await Promise.all([
      this.resolveTrendTimestamps(recordTrendWindow, now, [countRecordsAsOf, countSessionsAsOf]),
      this.resolveTrendTimestamps(subjectTrendWindow, now, [countSubjectsAsOf])
    ]);

    const countTrend = (timestamps: number[], countAsOf: CountAsOf): Promise<Summary['trends']['records']> => {
      return Promise.all(
        timestamps.map(async (timestamp) => ({ timestamp, value: await countAsOf(new Date(timestamp)) }))
      );
    };

    // None of these counts depend on one another, so they are issued concurrently: the endpoint costs
    // the slowest query rather than the sum of all of them.
    const [instruments, records, sessions, subjects, users, recordTrend, sessionTrend, subjectTrend] =
      await Promise.all([
        this.instrumentsService.count(currentUser, groupId),
        this.instrumentRecordsService.count(recordFilter, { ability }),
        this.sessionsService.count(sessionFilter, { ability }),
        this.subjectsService.count(filter, { ability }),
        this.usersService.count(filter, { ability }),
        countTrend(recordTimestamps, countRecordsAsOf),
        countTrend(recordTimestamps, countSessionsAsOf),
        countTrend(subjectTimestamps, countSubjectsAsOf)
      ]);

    return {
      counts: { instruments, records, sessions, subjects, users },
      trends: { records: recordTrend, sessions: sessionTrend, subjects: subjectTrend }
    };
  }

  /** Whether nothing any of the counts measures existed as of `timestamp`. */
  private async isEmptyAsOf(timestamp: number, countsAsOf: CountAsOf[]): Promise<boolean> {
    const counts = await Promise.all(countsAsOf.map((countAsOf) => countAsOf(new Date(timestamp))));
    return counts.every((count) => count === 0);
  }

  /**
   * The timestamps of a trend over `window`. For `all`, the shortest bounded window that reaches back
   * past every item the counts measure; past the longest, a span doubled from ten years until it does,
   * drawn as a fixed number of points so an old instance does not draw one point per year.
   */
  private async resolveTrendTimestamps(
    window: SummaryTrendWindow,
    now: number,
    countsAsOf: CountAsOf[]
  ): Promise<number[]> {
    if (window !== 'all') {
      return trendTimestamps(now, TREND_SPACINGS[window]);
    }
    for (const bounded of BOUNDED_WINDOWS) {
      const timestamps = trendTimestamps(now, TREND_SPACINGS[bounded]);
      if (await this.isEmptyAsOf(timestamps.at(-1)!, countsAsOf)) {
        return timestamps;
      }
    }
    let spanYears = 10;
    let timestamps = trendTimestamps(now, { count: ALL_TIME_POINT_COUNT, step: { years: spanYears / 5 } });
    while (!(await this.isEmptyAsOf(timestamps.at(-1)!, countsAsOf))) {
      spanYears *= 2;
      timestamps = trendTimestamps(now, { count: ALL_TIME_POINT_COUNT, step: { years: spanYears / 5 } });
    }
    return timestamps;
  }
}
