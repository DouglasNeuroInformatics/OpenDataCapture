import { Module } from '@nestjs/common';

import { GroupsModule } from '@/groups/groups.module';
import { LegacyInstrumentsModule } from '@/instruments/instruments.module';
import { SubjectsModule } from '@/subjects/subjects.module';
import { UsersModule } from '@/users/users.module';

import { DemoService } from './demo.service';
import { SetupController } from './setup.controller';
import { SetupService } from './setup.service';

@Module({
  controllers: [SetupController],
  imports: [GroupsModule, LegacyInstrumentsModule, SubjectsModule, UsersModule],
  providers: [DemoService, SetupService]
})
export class SetupModule {}
