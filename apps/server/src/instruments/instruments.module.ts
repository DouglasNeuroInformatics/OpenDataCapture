import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { InstrumentKind } from '@ddcp/common';
import { Schema } from 'mongoose';

import { FormsController } from './controllers/forms.controller';
import { FormInstrumentSchema } from './entities/form-instrument.entity';
import { InstrumentEntity, InstrumentSchema } from './entities/instrument.entity';
import { InstrumentsRepository } from './instruments.repository';

import { SubjectsModule } from '@/subjects/subjects.module';

interface InstrumentDiscriminator {
  name: InstrumentKind;
  schema: Schema;
}

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: InstrumentEntity.modelName,
        schema: InstrumentSchema,
        discriminators: [
          {
            name: InstrumentKind.Form,
            schema: FormInstrumentSchema
          }
        ] satisfies InstrumentDiscriminator[]
      }
    ]),
    SubjectsModule
  ],
  controllers: [FormsController],
  providers: [InstrumentsRepository],
  exports: []
})
export class InstrumentsModule {}
