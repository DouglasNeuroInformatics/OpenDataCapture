import { Module } from '@nestjs/common';

import { GroupsModule } from '@/groups/groups.module';
import { PrismaModule } from '@/prisma/prisma.module';

import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
  controllers: [UsersController],
  exports: [UsersService],
  imports: [
    GroupsModule,
    PrismaModule.forFeature('User'),
  ],
  providers: [UsersService]
})
export class UsersModule {}
