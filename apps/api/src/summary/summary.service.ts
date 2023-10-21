import { Inject, Injectable, Scope } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import type { Group, Summary } from '@open-data-capture/types';
import type { Request } from 'express';

import { GroupsService } from '@/groups/groups.service';
import { FormsService } from '@/instruments/forms.service';
import { SubjectsService } from '@/subjects/subjects.service';
import { UsersService } from '@/users/users.service';

@Injectable({ scope: Scope.REQUEST })
export class SummaryService {
  constructor(
    private readonly formsService: FormsService,
    private readonly groupsService: GroupsService,
    private readonly usersService: UsersService,
    private readonly subjectsService: SubjectsService,
    @Inject(REQUEST) private request: Request
  ) {}

  async getSummary(groupId?: string): Promise<Summary> {
    let group: Group;
    // const group = await this.groupsService.findById(groupId);
    return {
      counts: {
        instruments: await this.formsService.count(),
        records: NaN,
        subjects: await this.subjectsService.count(),
        users: await this.usersService.count()
      }
    };
  }

  private async createGroupQuery(groupId?: string) {
    if (!groupId) {
      return {};
    }
    const group = await this.groupsService.findById(groupId);
    return { group };
  }
}
