import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose/dist/mongoose.module';

import { InstrumentEntity, InstrumentSchema } from './entities/instrument.entity';
import { FormsService } from './forms.service';
import { InstrumentsController } from './instruments.controller';
import { InstrumentsRepository } from './instruments.repository';
import { InstrumentsService } from './instruments.service';

@Module({
  controllers: [InstrumentsController],
  exports: [FormsService],
  imports: [
    MongooseModule.forFeature([
      {
        name: InstrumentEntity.modelName,
        schema: InstrumentSchema
      }
    ])
  ],
  providers: [FormsService, InstrumentsRepository, InstrumentsService]
})
export class InstrumentsModule {}
