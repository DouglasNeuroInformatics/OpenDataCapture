import { RouteAccess } from '@douglasneuroinformatics/libnest';
import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import type { GatewayHealthcheckResult } from '@opendatacapture/schemas/gateway';

import { GatewayService } from './gateway.service';

@ApiTags('Gateway')
@Controller({ path: 'gateway' })
export class GatewayController {
  constructor(private readonly gatewayService: GatewayService) {}

  @Get('healthcheck')
  @RouteAccess([])
  healthcheck(): Promise<GatewayHealthcheckResult> {
    return this.gatewayService.healthcheck();
  }
}
