import { DatabaseModule } from '@douglasneuroinformatics/nestjs/modules';
import { Module } from '@nestjs/common';

import { InstrumentSourceEntity } from './entities/instrument-source.entity';
import { InstrumentsController } from './instruments.controller';
import { InstrumentsService } from './instruments.service';

@Module({
  controllers: [InstrumentsController],
  exports: [InstrumentsService],
  imports: [DatabaseModule.forFeature([InstrumentSourceEntity])],
  providers: [InstrumentsService]
})
export class InstrumentsModule {}
