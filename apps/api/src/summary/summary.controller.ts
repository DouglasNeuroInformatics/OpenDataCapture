import { CurrentUser, ParseSchemaPipe } from '@douglasneuroinformatics/libnest';
import type { RequestUser } from '@douglasneuroinformatics/libnest';
import { Controller, Get, Query } from '@nestjs/common';
import { $SummaryQueryParams } from '@opendatacapture/schemas/summary';
import type { Summary, SummaryQueryParams } from '@opendatacapture/schemas/summary';

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
  async getSummary(
    @CurrentUser() currentUser: RequestUser,
    @Query(new ParseSchemaPipe({ schema: $SummaryQueryParams })) query: SummaryQueryParams
  ): Promise<Summary> {
    return this.summaryService.getSummary(currentUser, query);
  }
}
