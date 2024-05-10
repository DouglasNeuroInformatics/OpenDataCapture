import { HttpModule } from '@nestjs/axios';
import { Module, forwardRef } from '@nestjs/common';

import { AssignmentsModule } from '@/assignments/assignments.module';
import { ConfigurationService } from '@/configuration/configuration.service';
import { InstrumentRecordsModule } from '@/instrument-records/instrument-records.module';
import { InstrumentsModule } from '@/instruments/instruments.module';
import { SessionsModule } from '@/sessions/sessions.module';
import { SetupModule } from '@/setup/setup.module';

import { GatewayService } from './gateway.service';
import { GatewaySynchronizer } from './gateway.synchronizer';

@Module({
  exports: [GatewayService],
  imports: [
    forwardRef(() => AssignmentsModule),
    HttpModule.registerAsync({
      inject: [ConfigurationService],
      useFactory: (configurationService: ConfigurationService) => {
        let baseURL: string;
        if (configurationService.get('NODE_ENV') === 'production') {
          const internalNetworkUrl = configurationService.get('GATEWAY_INTERNAL_NETWORK_URL');
          const siteAddress = configurationService.get('GATEWAY_SITE_ADDRESS');
          if (siteAddress.hostname === 'localhost' && internalNetworkUrl) {
            baseURL = internalNetworkUrl.origin;
          } else {
            baseURL = siteAddress.origin;
          }
        } else {
          const gatewayPort = configurationService.get('GATEWAY_DEV_SERVER_PORT');
          baseURL = `http://localhost:${gatewayPort}`;
        }
        return {
          baseURL,
          headers: {
            Authorization: `Bearer ${configurationService.get('GATEWAY_API_KEY')}`
          }
        };
      }
    }),
    InstrumentRecordsModule,
    InstrumentsModule,
    SessionsModule,
    SetupModule
  ],
  providers: [GatewayService, GatewaySynchronizer]
})
export class GatewayModule {}
