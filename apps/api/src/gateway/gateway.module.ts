import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';

import { ConfigurationService } from '@/configuration/configuration.service';
import { InstrumentRecordsModule } from '@/instrument-records/instrument-records.module';
import { InstrumentsModule } from '@/instruments/instruments.module';

import { GatewayService } from './gateway.service';
import { GatewaySynchronizer } from './gateway.synchronizer';

@Module({
  exports: [GatewayService],
  imports: [
    HttpModule.registerAsync({
      inject: [ConfigurationService],
      useFactory: (configurationService: ConfigurationService) => {
        return {
          headers: {
            Authorization: `Bearer ${configurationService.get('GATEWAY_API_KEY')}`
          }
        };
      }
    }),
    InstrumentRecordsModule,
    InstrumentsModule
  ],
  providers: [GatewayService, GatewaySynchronizer]
})
export class GatewayModule {}
