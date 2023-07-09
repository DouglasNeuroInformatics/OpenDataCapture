import { Module } from '@nestjs/common';

import { SetupController } from './setup.controller.js';
import { SetupService } from './setup.service.js';

import { UsersModule } from '@/users/users.module.js';

@Module({
  imports: [UsersModule],
  controllers: [SetupController],
  providers: [SetupService]
})
export class SetupModule {}
