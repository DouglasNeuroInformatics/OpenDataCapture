import { Module } from '@nestjs/common';

import { AssignmentsModule } from '@/assignments/assignments.module';
import { InstrumentRecordsModule } from '@/instrument-records/instrument-records.module';

import { GatewaySynchronizer } from './gateway.synchronizer';

@Module({
  imports: [AssignmentsModule, InstrumentRecordsModule],
  providers: [GatewaySynchronizer]
})
export class GatewayModule {}
