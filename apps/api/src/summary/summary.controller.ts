import { CurrentUser } from '@douglasneuroinformatics/libnest';
import { Controller, Get, Query } from '@nestjs/common';
import type { Summary } from '@opendatacapture/schemas/summary';

import type { AppAbility } from '@/auth/auth.types';
import { RouteAccess } from '@/core/decorators/route-access.decorator';

import { SummaryService } from './summary.service';

@Controller('summary')
export class SummaryController {
  constructor(private readonly summaryService: SummaryService) {}

  @Get()
  @RouteAccess([
    { action: 'read', subject: 'Instrument' },
    { action: 'read', subject: 'InstrumentRecord' },
    { action: 'read', subject: 'Session' },
    { action: 'read', subject: 'Subject' },
    { action: 'read', subject: 'User' }
  ])
  async getSummary(@CurrentUser('ability') ability: AppAbility, @Query('groupId') groupId?: string): Promise<Summary> {
    return this.summaryService.getSummary(groupId, { ability });
  }
}
