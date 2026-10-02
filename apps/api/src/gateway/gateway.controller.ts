import { Controller, Get } from '@nestjs/common';
import type { GatewayHealthcheckResult } from '@opendatacapture/schemas/gateway';

import { RouteAccess } from '@/core/decorators/route-access.decorator';

import { GatewayService } from './gateway.service';

@Controller({ path: 'gateway' })
export class GatewayController {
  constructor(private readonly gatewayService: GatewayService) {}

  @Get('healthcheck')
  @RouteAccess([])
  healthcheck(): Promise<GatewayHealthcheckResult> {
    return this.gatewayService.healthcheck();
  }
}
