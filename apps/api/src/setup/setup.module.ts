import { Module } from '@nestjs/common';

import { DemoService } from './demo.service';
import { SetupController } from './setup.controller';
import { SetupService } from './setup.service';

import { GroupsModule } from '@/groups/groups.module';
import { InstrumentsModule } from '@/instruments/instruments.module';
import { SubjectsModule } from '@/subjects/subjects.module';
import { UsersModule } from '@/users/users.module';

@Module({
  imports: [GroupsModule, InstrumentsModule, SubjectsModule, UsersModule],
  controllers: [SetupController],
  providers: [DemoService, SetupService]
})
export class SetupModule {}
