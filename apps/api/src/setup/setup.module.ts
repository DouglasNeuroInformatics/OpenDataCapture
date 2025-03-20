import { Module } from '@nestjs/common';

import { DemoModule } from '@/demo/demo.module';
import { UsersModule } from '@/users/users.module';

import { SetupController } from './setup.controller';
import { SetupService } from './setup.service';

@Module({
  controllers: [SetupController],
  exports: [SetupService],
  imports: [DemoModule, UsersModule],
  providers: [SetupService]
})
export class SetupModule {}
