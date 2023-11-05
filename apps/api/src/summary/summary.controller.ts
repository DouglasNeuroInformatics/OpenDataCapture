import { CurrentUser } from '@douglasneuroinformatics/nestjs/core';
import { Controller, Get, Query } from '@nestjs/common';
import type { AppAbility } from '@open-data-capture/common/core';
import type { Summary } from '@open-data-capture/common/summary';

import { RouteAccess } from '@/core/decorators/route-access.decorator';

import { SummaryService } from './summary.service';

@Controller('summary')
export class SummaryController {
  constructor(private readonly summaryService: SummaryService) {}

  @Get()
  @RouteAccess([{ action: 'read', subject: 'Instrument' }])
  async getSummary(@CurrentUser('ability') ability: AppAbility, @Query('groupId') groupId?: string): Promise<Summary> {
    return this.summaryService.getSummary(groupId, { ability });
  }
}
