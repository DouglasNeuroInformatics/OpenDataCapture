import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { InstrumentsController } from './instruments.controller';
import { InstrumentsService } from './instruments.service';
import { InstrumentRecordsRepository } from './repositories/instrument-records.repository';
import { InstrumentsRepository } from './repositories/instruments.repository';

import { SubjectsModule } from '@/subjects/subjects.module';

import { InstrumentRecord, InstrumentRecordSchema } from './schemas/instrument-record.schema';
import { Instrument, InstrumentSchema } from './schemas/instrument.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Instrument.name,
        schema: InstrumentSchema
      },
      {
        name: InstrumentRecord.name,
        schema: InstrumentRecordSchema
      }
    ]),
    SubjectsModule
  ],
  controllers: [InstrumentsController],
  providers: [InstrumentsService, InstrumentsRepository, InstrumentRecordsRepository]
})
export class InstrumentsModule {}
