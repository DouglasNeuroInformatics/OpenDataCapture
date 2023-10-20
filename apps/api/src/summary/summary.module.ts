import { Module } from '@nestjs/common';

import { SummaryController } from './summary.controller';
import { SummaryService } from './summary.service';

@Module({
  controllers: [SummaryController],
  exports: [SummaryService],
  providers: [SummaryService]
})
export class SummaryModule {}
