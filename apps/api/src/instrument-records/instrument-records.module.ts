import { Module } from '@nestjs/common';

import { GroupsModule } from '@/groups/groups.module';
import { InstrumentsModule } from '@/instruments/instruments.module';
import { PrismaModule } from '@/prisma/prisma.module';
import { SubjectsModule } from '@/subjects/subjects.module';

import { InstrumentRecordsController } from './instrument-records.controller';
import { InstrumentRecordsService } from './instrument-records.service';

@Module({
  controllers: [InstrumentRecordsController],
  exports: [InstrumentRecordsService],
  imports: [
    GroupsModule,
    InstrumentsModule,
    PrismaModule.forFeature('InstrumentRecord'),
    SubjectsModule
  ],
  providers: [InstrumentRecordsService]
})
export class InstrumentRecordsModule {}
