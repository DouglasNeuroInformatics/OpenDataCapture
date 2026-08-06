import { ConfigService } from '@douglasneuroinformatics/libnest';
import { HttpModule } from '@nestjs/axios';
import { forwardRef, Module } from '@nestjs/common';

import { AssignmentsModule } from '@/assignments/assignments.module';
import { InstrumentRecordsModule } from '@/instrument-records/instrument-records.module';
import { InstrumentsModule } from '@/instruments/instruments.module';
import { SessionsModule } from '@/sessions/sessions.module';
import { SetupModule } from '@/setup/setup.module';

import { GatewayController } from './gateway.controller';
import { GatewayService } from './gateway.service';
import { GatewaySynchronizer } from './gateway.synchronizer';

@Module({
  controllers: [GatewayController],
  exports: [GatewayService],
  imports: [
    forwardRef(() => AssignmentsModule),
    HttpModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
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
