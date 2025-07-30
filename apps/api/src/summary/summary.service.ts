import { Injectable } from '@nestjs/common';
import type { Summary } from '@opendatacapture/schemas/summary';

import type { EntityOperationOptions } from '@/core/types';
import { InstrumentRecordsService } from '@/instrument-records/instrument-records.service';
import { InstrumentsService } from '@/instruments/instruments.service';
import { SessionsService } from '@/sessions/sessions.service';
import { SubjectsService } from '@/subjects/subjects.service';
import { UsersService } from '@/users/users.service';

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

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

    const counts = {
      instruments: await this.instrumentsService.count(),
      records: await this.instrumentRecordsService.count(recordFilter, { ability }),
      sessions: await this.sessionsService.count(sessionFilter, { ability }),
      subjects: await this.subjectsService.count(filter, { ability }),
      users: await this.usersService.count(filter, { ability })
    };

    const now = Date.now();

    const trends: Summary['trends'] = {
      records: [],
      sessions: [],
      subjects: []
    };

    for (let i = 0; i < 5; i++) {
      const timestamp = now - THIRTY_DAYS_MS * i;
      const lte = new Date(timestamp);
      trends.records.push({
        timestamp,
        value: await this.instrumentRecordsService.count({ date: { lte }, ...recordFilter }, { ability })
      });
      trends.sessions.push({
        timestamp,
        value: await this.sessionsService.count({ date: { lte }, ...sessionFilter }, { ability })
      });
      trends.subjects.push({
        timestamp,
        value: await this.subjectsService.count({ createdAt: { lte }, ...filter }, { ability })
      });
    }

    return {
      counts,
      trends
    };
  }
}
