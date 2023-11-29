import { DatabaseModule } from '@douglasneuroinformatics/nestjs/modules';
import { Module } from '@nestjs/common';

import { GroupsModule } from '@/groups/groups.module';
import { InstrumentsModule } from '@/instruments/instruments.module';
import { SubjectsModule } from '@/subjects/subjects.module';

import { InstrumentRecordEntity } from './entities/instrument-record.entity';
import { InstrumentRecordsController } from './instrument-records.controller';
import { InstrumentRecordsService } from './instrument-records.service';

@Module({
  controllers: [InstrumentRecordsController],
  exports: [InstrumentRecordsService],
  imports: [
    DatabaseModule.forFeature([InstrumentRecordEntity]),
    GroupsModule,
    InstrumentsModule,
    SubjectsModule
  ],
  providers: [InstrumentRecordsService]
})
export class InstrumentRecordsModule {}
