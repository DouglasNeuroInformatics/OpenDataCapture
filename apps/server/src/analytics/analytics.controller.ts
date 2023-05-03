import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { RouteAccess } from '@/core/decorators/route-access.decorator';

@ApiTags('Analytics')
@Controller('analytics')
export class AnalyticsController {
  @Get()
  @RouteAccess({ action: 'manage', subject: 'all' })
  getAnalytics(): any {
    return 'foo';
  }
}
