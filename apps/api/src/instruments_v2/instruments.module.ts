import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose/dist/mongoose.module';
import type { InstrumentKind } from '@open-data-capture/types';
import type { Schema } from 'mongoose';

import { FormsController } from './controllers/forms.controller';
import { FormInstrumentSchema, InstrumentEntity, InstrumentSchema } from './entities/instrument.entity';
import { InstrumentRepository } from './repositories/instrument.repository';
import { FormsService } from './services/forms.service';

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
  providers: [FormsService, InstrumentRepository]
})
export class InstrumentsModule {}
