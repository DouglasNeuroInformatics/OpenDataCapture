import { HttpModule } from '@nestjs/axios';
import { Module, forwardRef } from '@nestjs/common';

import { AssignmentsModule } from '@/assignments/assignments.module';
import { ConfigurationService } from '@/configuration/configuration.service';
import { InstrumentRecordsModule } from '@/instrument-records/instrument-records.module';
import { InstrumentsModule } from '@/instruments/instruments.module';
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
        return {
          headers: {
            Authorization: `Bearer ${configurationService.get('GATEWAY_API_KEY')}`
          }
        };
      }
    }),
    InstrumentRecordsModule,
    InstrumentsModule,
    SetupModule
  ],
  providers: [GatewayService, GatewaySynchronizer]
})
export class GatewayModule {}
