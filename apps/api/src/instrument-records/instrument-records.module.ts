import { Module } from '@nestjs/common';

import { GroupsModule } from '@/groups/groups.module';
import { InstrumentsModule } from '@/instruments/instruments.module';
import { PrismaModule } from '@/prisma/prisma.module';
import { SessionsModule } from '@/sessions/sessions.module';
import { SubjectsModule } from '@/subjects/subjects.module';
import { VirtualizationModule } from '@/virtualization/virtualization.module';

import { InstrumentMeasuresService } from './instrument-measures.service';
import { InstrumentRecordsController } from './instrument-records.controller';
import { InstrumentRecordsService } from './instrument-records.service';

@Module({
  controllers: [InstrumentRecordsController],
  exports: [InstrumentRecordsService],
  imports: [
    GroupsModule,
    InstrumentsModule,
    PrismaModule.forFeature('InstrumentRecord'),
    SessionsModule,
    SubjectsModule,
    VirtualizationModule
  ],
  providers: [InstrumentMeasuresService, InstrumentRecordsService]
})
export class InstrumentRecordsModule {}
