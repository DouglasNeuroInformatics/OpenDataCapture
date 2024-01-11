import { Module } from '@nestjs/common';

import { GroupsModule } from '@/groups/groups.module';
import { InstrumentRecordsModule } from '@/instrument-records/instrument-records.module';
import { InstrumentsModule } from '@/instruments/instruments.module';
import { SubjectsModule } from '@/subjects/subjects.module';
import { UsersModule } from '@/users/users.module';
import { VisitsModule } from '@/visits/visits.module';

import { DemoService } from './demo.service';

@Module({
  exports: [DemoService],
  imports: [
    GroupsModule,
    InstrumentRecordsModule,
    InstrumentsModule,
    SubjectsModule,
    UsersModule,
    VisitsModule
  ],
  providers: [DemoService]
})
export class DemoModule {}
