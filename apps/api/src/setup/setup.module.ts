import { Module } from '@nestjs/common';

import { DemoModule } from '@/demo/demo.module';
import { PrismaModule } from '@/prisma/prisma.module';
import { UsersModule } from '@/users/users.module';

import { SetupController } from './setup.controller';
import { SetupOptions } from './setup.options';
import { SetupService } from './setup.service';

@Module({
  controllers: [SetupController],
  exports: [SetupOptions],
  imports: [DemoModule, PrismaModule.forFeature('SetupOption'), UsersModule],
  providers: [SetupOptions, SetupService]
})
export class SetupModule {}
