import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { InstrumentKind } from '@ddcp/common/types';
import { Schema } from 'mongoose';

import { InstrumentsController } from './instruments.controller';
import { InstrumentsRepository } from './instruments.repository';
import { InstrumentsService } from './instruments.service';
import { FormSchema } from './entities/form.entity';
import { Instrument, InstrumentSchema } from './entities/instrument.entity';

import { SubjectsModule } from '@/subjects/subjects.module';

interface InstrumentDiscriminator {
  name: InstrumentKind;
  schema: Schema;
}

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Instrument.name,
        schema: InstrumentSchema,
        discriminators: [
          {
            name: 'FORM',
            schema: FormSchema
          }
        ] satisfies InstrumentDiscriminator[]
      }
    ]),
    SubjectsModule
  ],
  controllers: [InstrumentsController],
  providers: [InstrumentsService, InstrumentsRepository],
  exports: [InstrumentsService]
})
export class InstrumentsModule {}
