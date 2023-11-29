import { Module } from '@nestjs/common';

import { InstrumentsModule } from '@/_instruments/instruments.module';
import { GroupsModule } from '@/groups/groups.module';
import { InstrumentRecordsModule } from '@/instrument-records/instrument-records.module';
import { SubjectsModule } from '@/subjects/subjects.module';
import { UsersModule } from '@/users/users.module';

import { SummaryController } from './summary.controller';
import { SummaryService } from './summary.service';

@Module({
  controllers: [SummaryController],
  exports: [SummaryService],
  imports: [GroupsModule, InstrumentRecordsModule, InstrumentsModule, SubjectsModule, UsersModule],
  providers: [SummaryService]
})
export class SummaryModule {}
