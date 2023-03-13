import { Module } from '@nestjs/common';

import { InitDemoCommand } from './commands/init-demo.command';
import { DemoService } from './demo.service';

import { UsersModule } from '@/users/users.module';

@Module({
  imports: [UsersModule],
  providers: [DemoService, InitDemoCommand],
  exports: [DemoService]
})
export class DemoModule {}
