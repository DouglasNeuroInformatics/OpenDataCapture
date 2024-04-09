import { CurrentUser } from '@douglasneuroinformatics/libnest/core';
import { Controller, Get, Query } from '@nestjs/common';
import type { Summary } from '@opendatacapture/schemas/summary';

import { RouteAccess } from '@/core/decorators/route-access.decorator';
import type { AppAbility } from '@/core/types';

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
