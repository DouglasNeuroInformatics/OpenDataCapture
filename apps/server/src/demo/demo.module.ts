import { Module } from '@nestjs/common';

import { InitDemoCommand } from './commands/init-demo.command';
import { DemoService } from './demo.service';

import { GroupsModule } from '@/groups/groups.module';
import { UsersModule } from '@/users/users.module';

@Module({
  imports: [GroupsModule, UsersModule],
  providers: [DemoService, InitDemoCommand],
  exports: [DemoService]
})
export class DemoModule {}
