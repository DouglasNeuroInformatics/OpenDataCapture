import { Module } from '@nestjs/common';

import { PrismaModule } from '@/prisma/prisma.module';
import { VirtualizationModule } from '@/virtualization/virtualization.module';

import { InstrumentsController } from './instruments.controller';
import { InstrumentsService } from './instruments.service';

@Module({
  controllers: [InstrumentsController],
  exports: [InstrumentsService],
  imports: [PrismaModule.forFeature('Instrument'), VirtualizationModule],
  providers: [InstrumentsService]
})
export class InstrumentsModule {}
