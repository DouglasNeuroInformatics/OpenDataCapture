import { Module } from '@nestjs/common';

import { GroupsModule } from '@/groups/groups.module';
import { InstrumentRecordsModule } from '@/instrument-records/instrument-records.module';
import { InstrumentsModule } from '@/instruments/instruments.module';
import { SessionsModule } from '@/sessions/sessions.module';
import { SubjectsModule } from '@/subjects/subjects.module';

import { StartSessionController } from './start-session.controller';
import { StartSessionService } from './start-session.service';

// Starting a session creates the record of the group's session instrument with it, and
// `InstrumentRecordsModule` already imports `SessionsModule`, so the two meet here rather than in either.
@Module({
  controllers: [StartSessionController],
  imports: [GroupsModule, InstrumentRecordsModule, InstrumentsModule, SessionsModule, SubjectsModule],
  providers: [StartSessionService]
})
export class StartSessionModule {}
