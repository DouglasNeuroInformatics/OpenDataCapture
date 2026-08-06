import { ConfigService } from '@douglasneuroinformatics/libnest';
import { HttpModule } from '@nestjs/axios';
import type { HttpModuleOptions } from '@nestjs/axios';
import { forwardRef, Module } from '@nestjs/common';

import { AssignmentsModule } from '@/assignments/assignments.module';
import { InstrumentRecordsModule } from '@/instrument-records/instrument-records.module';
import { InstrumentsModule } from '@/instruments/instruments.module';
import { SessionsModule } from '@/sessions/sessions.module';
import { SetupModule } from '@/setup/setup.module';

import { GatewayController } from './gateway.controller';
import { GatewayService } from './gateway.service';
import { GatewaySynchronizer } from './gateway.synchronizer';

function createGatewayHttpOptions(configService: ConfigService): HttpModuleOptions {
  let baseURL: string;
  if (configService.get('NODE_ENV') === 'production') {
    const internalNetworkUrl = configService.get('GATEWAY_INTERNAL_NETWORK_URL');
    const siteAddress = configService.getOrThrow('GATEWAY_SITE_ADDRESS');
    if (siteAddress.hostname === 'localhost' && internalNetworkUrl) {
      baseURL = internalNetworkUrl.origin;
    } else {
      baseURL = siteAddress.origin;
    }
  } else {
    const gatewayPort = configService.get('GATEWAY_DEV_SERVER_PORT');
    baseURL = `http://localhost:${gatewayPort}`;
  }
  return {
    baseURL,
    headers: {
      Authorization: `Bearer ${configService.get('GATEWAY_API_KEY')}`
    },
    // Axios rejects on a non-2xx by default, which would surface every answer the gateway gives — a
    // rejected API key, a validation failure — as an unrecognized error, and so as a 500 naming
    // neither the gateway nor the status. Resolving every status is what lets GatewayService report
    // what actually came back.
    validateStatus: () => true
  };
}

@Module({
  controllers: [GatewayController],
  exports: [GatewayService],
  imports: [
    forwardRef(() => AssignmentsModule),
    HttpModule.registerAsync({
      inject: [ConfigService],
      useFactory: createGatewayHttpOptions
    }),
    InstrumentRecordsModule,
    InstrumentsModule,
    SessionsModule,
    SetupModule
  ],
  providers: [GatewayService, GatewaySynchronizer]
})
export class GatewayModule {}

export { createGatewayHttpOptions };
