import { Module } from '@nestjs/common';

import { StatsService } from './stats.service.js';

@Module({
  providers: [StatsService],
  exports: [StatsService]
})
export class StatsModule {}
