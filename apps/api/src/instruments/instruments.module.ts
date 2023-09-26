import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { AjvModule } from '@douglasneuroinformatics/nestjs/modules';
import type { InstrumentKind } from '@open-data-capture/types';
import { Schema } from 'mongoose';

import { FormRecordsController } from './controllers/form-records.controller';
import { FormsController } from './controllers/forms.controller';
import { FormInstrumentRecordSchema } from './entities/form-instrument-record.entity';
import { FormInstrumentSchema } from './entities/form-instrument.entity';
import { InstrumentRecordEntity, InstrumentRecordSchema } from './entities/instrument-record.entity';
import { InstrumentEntity, InstrumentSchema } from './entities/instrument.entity';
import { FormRecordsService } from './services/form-records.service';
import { FormsService } from './services/forms.service';

import { GroupsModule } from '@/groups/groups.module';
import { SubjectsModule } from '@/subjects/subjects.module';


type InstrumentDiscriminator = {
  name: InstrumentKind;
  schema: Schema;
};

@Module({
  imports: [
    AjvModule,
    GroupsModule,
    MongooseModule.forFeature([
      {
        name: InstrumentEntity.modelName,
        schema: InstrumentSchema,
        discriminators: [
          {
            name: 'form',
            schema: FormInstrumentSchema
          }
        ] satisfies InstrumentDiscriminator[]
      },
      {
        name: InstrumentRecordEntity.modelName,
        schema: InstrumentRecordSchema,
        discriminators: [
          {
            name: 'form',
            schema: FormInstrumentRecordSchema
          }
        ] satisfies InstrumentDiscriminator[]
      }
    ]),
    SubjectsModule
  ],
  controllers: [FormsController, FormRecordsController],
  providers: [FormsService, FormRecordsService],
  exports: [FormsService, FormRecordsService]
})
export class InstrumentsModule {}
