import { Injectable } from '@nestjs/common';
import type { Summary } from '@opendatacapture/schemas/summary';

import type { EntityOperationOptions } from '@/core/types';
import { InstrumentRecordsService } from '@/instrument-records/instrument-records.service';
import { InstrumentsService } from '@/instruments/instruments.service';
import { SubjectsService } from '@/subjects/subjects.service';
import { UsersService } from '@/users/users.service';

@Injectable()
export class SummaryService {
  constructor(
    private readonly instrumentRecordsService: InstrumentRecordsService,
    private readonly instrumentsService: InstrumentsService,
    private readonly usersService: UsersService,
    private readonly subjectsService: SubjectsService
  ) {}

  async getSummary(groupId?: string, { ability }: EntityOperationOptions = {}): Promise<Summary> {
    const filter = groupId ? { groupIds: { has: groupId } } : ({} as { [key: string]: unknown });
    return {
      counts: {
        instruments: await this.instrumentsService.count(),
        records: await this.instrumentRecordsService.count({ groupId }, { ability }),
        subjects: await this.subjectsService.count(filter, { ability }),
        users: await this.usersService.count(filter, { ability })
      }
    };
  }
}
