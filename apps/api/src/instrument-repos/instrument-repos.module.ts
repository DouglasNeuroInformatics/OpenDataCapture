import { Module } from '@nestjs/common';

import { InstrumentsModule } from '@/instruments/instruments.module';

import { InstrumentReposController } from './instrument-repos.controller';
import { InstrumentReposService } from './instrument-repos.service';

@Module({
  controllers: [InstrumentReposController],
  exports: [InstrumentReposService],
  imports: [InstrumentsModule],
  providers: [InstrumentReposService]
})
export class InstrumentReposModule {}
