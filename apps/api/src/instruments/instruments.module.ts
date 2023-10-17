import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose/dist/mongoose.module';
import type { InstrumentKind } from '@open-data-capture/types';
import type { Schema } from 'mongoose';

import { FormInstrumentSchema, InstrumentEntity, InstrumentSchema } from './entities/instrument.entity';
import { FormsController } from './forms.controller';
import { FormsService } from './forms.service';
import { InstrumentsRepository } from './instruments.repository';

type InstrumentDiscriminator = {
  name: InstrumentKind;
  schema: Schema;
};

@Module({
  controllers: [FormsController],
  exports: [FormsService],
  imports: [
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
      }
    ])
  ],
  providers: [FormsService, InstrumentsRepository]
})
export class InstrumentsModule {}
