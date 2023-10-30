import { Injectable } from '@nestjs/common';
import type { Summary } from '@open-data-capture/common/summary';

import type { EntityOperationOptions } from '@/core/types';
import { GroupsService } from '@/groups/groups.service';
import { FormsService } from '@/instruments/forms.service';
import { SubjectsService } from '@/subjects/subjects.service';
import { UsersService } from '@/users/users.service';

@Injectable()
export class SummaryService {
  constructor(
    private readonly formsService: FormsService,
    private readonly groupsService: GroupsService,
    private readonly usersService: UsersService,
    private readonly subjectsService: SubjectsService
  ) {}

  async getSummary(groupId?: string, { ability }: EntityOperationOptions = {}): Promise<Summary> {
    const group = groupId ? await this.groupsService.findById(groupId) : undefined;
    const args = [{ groups: group }, { ability }];
    return {
      counts: {
        instruments: await this.formsService.count(),
        records: NaN,
        subjects: await this.subjectsService.count(...args),
        users: await this.usersService.count(...args)
      }
    };
  }
}
