import { Module } from '@nestjs/common';

import { _InstrumentsModule } from '@/_instruments/instruments.module';
import { GroupsModule } from '@/groups/groups.module';
import { InstrumentRecordsModule } from '@/instrument-records/instrument-records.module';
import { SubjectsModule } from '@/subjects/subjects.module';
import { UsersModule } from '@/users/users.module';
import { VisitsModule } from '@/visits/visits.module';

import { DemoService } from './demo.service';
import { SetupController } from './setup.controller';
import { SetupService } from './setup.service';

@Module({
  controllers: [SetupController],
  imports: [GroupsModule, InstrumentRecordsModule, _InstrumentsModule, SubjectsModule, UsersModule, VisitsModule],
  providers: [DemoService, SetupService]
})
export class SetupModule {}
