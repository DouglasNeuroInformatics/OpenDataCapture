import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose/dist/mongoose.module';

import { FormsController } from './controllers/forms.controller';
import { InstrumentEntity, InstrumentSchema } from './entities/instrument.entity';
import { InstrumentRepository } from './repositories/instrument.repository';
import { FormsService } from './services/forms.service';

@Module({
  controllers: [FormsController],
  imports: [
    MongooseModule.forFeature([
      {
        name: InstrumentEntity.modelName,
        schema: InstrumentSchema
      }
    ])
  ],
  providers: [FormsService, InstrumentRepository]
})
export class InstrumentsModule {}
