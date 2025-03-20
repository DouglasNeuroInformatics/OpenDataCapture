import { CurrentUser, RouteAccess } from '@douglasneuroinformatics/libnest';
import type { AppAbility } from '@douglasneuroinformatics/libnest';
import { Controller, Get, Query } from '@nestjs/common';
import type { Summary } from '@opendatacapture/schemas/summary';

import { SummaryService } from './summary.service';

@Controller('summary')
export class SummaryController {
  constructor(private readonly summaryService: SummaryService) {}

  @Get()
  @RouteAccess([
    { action: 'read', subject: 'Instrument' },
    { action: 'read', subject: 'InstrumentRecord' },
    { action: 'read', subject: 'Subject' },
    { action: 'read', subject: 'User' }
  ])
  async getSummary(@CurrentUser('ability') ability: AppAbility, @Query('groupId') groupId?: string): Promise<Summary> {
    return this.summaryService.getSummary(groupId, { ability });
  }
}
