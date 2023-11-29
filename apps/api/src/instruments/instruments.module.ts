import { DatabaseModule } from '@douglasneuroinformatics/nestjs/modules';
import { Module } from '@nestjs/common';

import { InstrumentEntity } from './entities/instrument.entity';
import { InstrumentsController } from './instruments.controller';
import { InstrumentsService } from './instruments.service';

@Module({
  controllers: [InstrumentsController],
  exports: [InstrumentsService],
  imports: [DatabaseModule.forFeature([InstrumentEntity])],
  providers: [InstrumentsService]
})
export class InstrumentsModule {}
