import { Injectable } from '@nestjs/common';
import type { Summary } from '@open-data-capture/types';

import { FormsService } from '@/instruments/forms.service';
import { SubjectsService } from '@/subjects/subjects.service';
import { UsersService } from '@/users/users.service';

@Injectable()
export class SummaryService {
  constructor(
    private readonly formsService: FormsService,
    private readonly usersService: UsersService,
    private readonly subjectsService: SubjectsService
  ) {}

  async getSummary(): Promise<Summary> {
    return {
      counts: {
        instruments: await this.formsService.count(),
        records: NaN,
        subjects: await this.subjectsService.count(),
        users: await this.usersService.count()
      }
    };
  }
}
