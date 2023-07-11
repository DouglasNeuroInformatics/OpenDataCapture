import { Module } from '@nestjs/common';

import { DemoService } from './demo.service.js';
import { SetupController } from './setup.controller.js';
import { SetupService } from './setup.service.js';

import { GroupsModule } from '@/groups/groups.module.js';
import { InstrumentsModule } from '@/instruments/instruments.module.js';
import { SubjectsModule } from '@/subjects/subjects.module.js';
import { UsersModule } from '@/users/users.module.js';

@Module({
  imports: [GroupsModule, InstrumentsModule, SubjectsModule, UsersModule],
  controllers: [SetupController],
  providers: [DemoService, SetupService]
})
export class SetupModule {}
