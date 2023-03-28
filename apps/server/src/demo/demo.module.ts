import { Module } from '@nestjs/common';

import { InitDemoCommand } from './commands/init-demo.command';
import { DemoService } from './demo.service';

import { GroupsModule } from '@/groups/groups.module';
import { InstrumentsModule } from '@/instruments/instruments.module';
import { SubjectsModule } from '@/subjects/subjects.module';
import { UsersModule } from '@/users/users.module';

@Module({
  imports: [GroupsModule, UsersModule, SubjectsModule, InstrumentsModule],
  providers: [DemoService, InitDemoCommand],
  exports: [DemoService]
})
export class DemoModule {}
