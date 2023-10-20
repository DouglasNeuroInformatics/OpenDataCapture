import { Module } from '@nestjs/common';

import { InstrumentsModule } from '@/instruments/instruments.module';

import { SummaryController } from './summary.controller';
import { SummaryService } from './summary.service';

@Module({
  controllers: [SummaryController],
  exports: [SummaryService],
  imports: [InstrumentsModule],
  providers: [SummaryService]
})
export class SummaryModule {}
