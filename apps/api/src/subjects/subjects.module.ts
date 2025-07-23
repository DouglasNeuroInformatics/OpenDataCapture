import { Module } from '@nestjs/common';

import { SubjectsDataService } from './subjects-data.service';
// import { InstrumentRecordsModule } from '@/instrument-records/instrument-records.module';
import { SubjectsController } from './subjects.controller';
import { SubjectsService } from './subjects.service';

@Module({
  controllers: [SubjectsController],
  exports: [SubjectsService],
  providers: [SubjectsService, SubjectsDataService]
})
export class SubjectsModule {}
