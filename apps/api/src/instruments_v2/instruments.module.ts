import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose/dist/mongoose.module';

import { InstrumentEntity, InstrumentSchema } from './entities/instrument.entity';
import { InstrumentRepository } from './instrument.repository';
import { InstrumentsController } from './instruments.controller';
import { InstrumentsService } from './instruments.service';

@Module({
  controllers: [InstrumentsController],
  imports: [
    MongooseModule.forFeature([
      {
        name: InstrumentEntity.modelName,
        schema: InstrumentSchema
      }
    ])
  ],
  providers: [InstrumentRepository, InstrumentsService]
})
export class InstrumentsModule {}
