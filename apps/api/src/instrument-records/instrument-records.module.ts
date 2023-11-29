import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { _InstrumentsModule } from '@/_instruments/instruments.module';
import { GroupsModule } from '@/groups/groups.module';
import { SubjectsModule } from '@/subjects/subjects.module';

import { InstrumentRecordEntity, InstrumentRecordSchema } from './entities/instrument-record.entity';
import { InstrumentRecordsController } from './instrument-records.controller';
import { InstrumentRecordsRepository } from './instrument-records.repository';
import { InstrumentRecordsService } from './instrument-records.service';

@Module({
  controllers: [InstrumentRecordsController],
  exports: [InstrumentRecordsService],
  imports: [
    GroupsModule,
    _InstrumentsModule,
    MongooseModule.forFeature([
      {
        name: InstrumentRecordEntity.modelName,
        schema: InstrumentRecordSchema
      }
    ]),
    SubjectsModule
  ],
  providers: [InstrumentRecordsRepository, InstrumentRecordsService]
})
export class InstrumentRecordsModule {}
