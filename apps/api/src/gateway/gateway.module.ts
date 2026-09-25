import { ConfigService } from '@douglasneuroinformatics/libnest';
import { HttpModule } from '@nestjs/axios';
import { forwardRef, Module } from '@nestjs/common';

import { AssignmentsModule } from '@/assignments/assignments.module';
import { InstrumentRecordsModule } from '@/instrument-records/instrument-records.module';
import { InstrumentsModule } from '@/instruments/instruments.module';
import { SessionsModule } from '@/sessions/sessions.module';
import { SetupModule } from '@/setup/setup.module';

import { GatewayController } from './gateway.controller';
import { createGatewayHttpOptions } from './gateway.http';
import { GatewayService } from './gateway.service';
import { GatewaySynchronizer } from './gateway.synchronizer';

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
