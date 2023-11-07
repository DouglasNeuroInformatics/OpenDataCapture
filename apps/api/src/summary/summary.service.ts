import { Injectable } from '@nestjs/common';
import type { Summary } from '@open-data-capture/common/summary';

import type { EntityOperationOptions } from '@/core/types';
import { GroupsService } from '@/groups/groups.service';
import { InstrumentRecordsService } from '@/instrument-records/instrument-records.service';
import { InstrumentsService } from '@/instruments/instruments.service';
import { SubjectsService } from '@/subjects/subjects.service';
import { UsersService } from '@/users/users.service';

@Injectable()
export class SummaryService {
  constructor(
    private readonly groupsService: GroupsService,
    private readonly instrumentRecordsService: InstrumentRecordsService,
    private readonly instrumentsService: InstrumentsService,
    private readonly usersService: UsersService,
    private readonly subjectsService: SubjectsService
  ) {}

  async getSummary(groupId?: string, { ability }: EntityOperationOptions = {}): Promise<Summary> {
    const group = groupId ? await this.groupsService.findById(groupId) : undefined;
    return {
      counts: {
        instruments: await this.instrumentsService.count(),
        records: await this.instrumentRecordsService.count({}, { ability }),
        subjects: await this.subjectsService.count({ groups: group }, { ability }),
        users: await this.usersService.count({ groups: group }, { ability })
      }
    };
  }
}
