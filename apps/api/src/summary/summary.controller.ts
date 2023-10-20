import { Controller, Get } from '@nestjs/common';
import type { Summary } from '@open-data-capture/types';

import { SummaryService } from './summary.service';

@Controller()
export class SummaryController {
  constructor(private readonly summaryService: SummaryService) {}

  @Get()
  getSummary(): Summary {
    return this.summaryService.getSummary();
  }
}
