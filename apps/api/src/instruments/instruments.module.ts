import { Module } from '@nestjs/common';

import { PrismaModule } from '@/prisma/prisma.module';

import { InstrumentsController } from './instruments.controller';
import { InstrumentsService } from './instruments.service';

@Module({
  controllers: [InstrumentsController],
  exports: [InstrumentsService],
  imports: [PrismaModule.forFeature('Instrument')],
  providers: [InstrumentsService]
})
export class InstrumentsModule {}
