import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose/dist/mongoose.module';

import { InstrumentEntity, InstrumentSchema } from './entities/instrument.entity';
import { InstrumentsController } from './instruments.controller';
import { InstrumentsService } from './instruments.service';

@Module({
  controllers: [InstrumentsController],
  exports: [InstrumentsService],
  imports: [
    MongooseModule.forFeature([
      {
        name: InstrumentEntity.modelName,
        schema: InstrumentSchema
      }
    ])
  ],
  providers: [InstrumentsService]
})
export class InstrumentsModule {}
