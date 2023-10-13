import { AjvModule } from '@douglasneuroinformatics/nestjs/modules';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import type { InstrumentKind } from '@open-data-capture/types';
import { Schema } from 'mongoose';

import { GroupsModule } from '@/groups/groups.module';
import { SubjectsModule } from '@/subjects/subjects.module';

import { FormRecordsController } from './controllers/form-records.controller';
import { FormsController } from './controllers/forms.controller';
import { FormInstrumentSchema } from './entities/form-instrument.entity';
import { FormInstrumentRecordSchema } from './entities/form-instrument-record.entity';
import { InstrumentEntity, InstrumentSchema } from './entities/instrument.entity';
import { InstrumentRecordEntity, InstrumentRecordSchema } from './entities/instrument-record.entity';
import { FormRecordsService } from './services/form-records.service';
import { FormsService } from './services/forms.service';


type InstrumentDiscriminator = {
  name: InstrumentKind;
  schema: Schema;
};

@Module({
  controllers: [FormsController, FormRecordsController],
  exports: [FormsService, FormRecordsService],
  imports: [
    AjvModule,
    GroupsModule,
    MongooseModule.forFeature([
      {
        discriminators: [
          {
            name: 'form',
            schema: FormInstrumentSchema
          }
        ] satisfies InstrumentDiscriminator[],
        name: InstrumentEntity.modelName,
        schema: InstrumentSchema
      },
      {
        discriminators: [
          {
            name: 'form',
            schema: FormInstrumentRecordSchema
          }
        ] satisfies InstrumentDiscriminator[],
        name: InstrumentRecordEntity.modelName,
        schema: InstrumentRecordSchema
      }
    ]),
    SubjectsModule
  ],
  providers: [FormsService, FormRecordsService]
})
export class LegacyInstrumentsModule {}
