import { forwardRef, Module } from '@nestjs/common';

import { InstrumentRecordsModule } from '@/instrument-records/instrument-records.module';

import { SubjectsController } from './subjects.controller';
import { SubjectsService } from './subjects.service';

@Module({
  controllers: [SubjectsController],
  exports: [SubjectsService],
  imports: [forwardRef(() => InstrumentRecordsModule)],
  providers: [SubjectsService]
})
export class SubjectsModule {}
