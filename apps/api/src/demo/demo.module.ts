import { Module } from '@nestjs/common';

import { GroupsModule } from '@/groups/groups.module';
import { InstrumentRecordsModule } from '@/instrument-records/instrument-records.module';
import { InstrumentsModule } from '@/instruments/instruments.module';
import { SessionsModule } from '@/sessions/sessions.module';
import { SubjectsModule } from '@/subjects/subjects.module';
import { UsersModule } from '@/users/users.module';

import { DemoService } from './demo.service';

@Module({
  exports: [DemoService],
  imports: [GroupsModule, InstrumentRecordsModule, InstrumentsModule, SessionsModule, SubjectsModule, UsersModule],
  providers: [DemoService]
})
export class DemoModule {}
