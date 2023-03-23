import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { InstrumentKind } from './enums/instrument-kind.enum';
import { InstrumentsController } from './instruments.controller';
import { InstrumentsRepository } from './instruments.repository';
import { InstrumentsService } from './instruments.service';
import { FormSchema } from './schemas/form.schema';
import { Instrument, InstrumentSchema } from './schemas/instrument.schema';

import { SubjectsModule } from '@/subjects/subjects.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Instrument.name,
        schema: InstrumentSchema,
        discriminators: [
          {
            name: InstrumentKind.Form,
            schema: FormSchema
          }
        ]
      }
    ]),
    SubjectsModule
  ],
  controllers: [InstrumentsController],
  providers: [InstrumentsService, InstrumentsRepository],
  exports: [InstrumentsService]
})
export class InstrumentsModule {}
