import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { InstrumentKind } from '@ddcp/types';
import { Schema } from 'mongoose';

import { FormRecordsController } from './controllers/form-records.controller.js';
import { FormsController } from './controllers/forms.controller.js';
import { FormInstrumentRecordSchema } from './entities/form-instrument-record.entity.js';
import { FormInstrumentSchema } from './entities/form-instrument.entity.js';
import { InstrumentRecordEntity, InstrumentRecordSchema } from './entities/instrument-record.entity.js';
import { InstrumentEntity, InstrumentSchema } from './entities/instrument.entity.js';
import { InstrumentRecordsRepository } from './repositories/instrument-records.repository.js';
import { InstrumentsRepository } from './repositories/instruments.repository.js';
import { FormRecordsService } from './services/form-records.service.js';
import { FormsService } from './services/forms.service.js';

import { AjvModule } from '@/ajv/ajv.module.js';
import { CryptoModule } from '@/crypto/crypto.module.js';
import { GroupsModule } from '@/groups/groups.module.js';
import { SubjectsModule } from '@/subjects/subjects.module.js';

interface InstrumentDiscriminator {
  name: InstrumentKind;
  schema: Schema;
}

@Module({
  imports: [
    AjvModule,
    CryptoModule,
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
  providers: [InstrumentsRepository, InstrumentRecordsRepository, FormsService, FormRecordsService],
  exports: [FormsService, FormRecordsService]
})
export class InstrumentsModule {}
