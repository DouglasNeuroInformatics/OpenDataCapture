import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';

import { InstrumentRecordsModule } from '@/instrument-records/instrument-records.module';

import { GatewaySynchronizer } from './gateway.synchronizer';

@Module({
  imports: [HttpModule, InstrumentRecordsModule],
  providers: [GatewaySynchronizer]
})
export class GatewayModule {}
