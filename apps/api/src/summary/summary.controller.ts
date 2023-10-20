import { Controller, Get } from '@nestjs/common';
import type { Summary } from '@open-data-capture/types';

import { RouteAccess } from '@/core/decorators/route-access.decorator';

import { SummaryService } from './summary.service';

@Controller('summary')
export class SummaryController {
  constructor(private readonly summaryService: SummaryService) {}

  @Get()
  @RouteAccess([{ action: 'read', subject: 'Instrument' }])
  async getSummary(): Promise<Summary> {
    return this.summaryService.getSummary();
  }
}
