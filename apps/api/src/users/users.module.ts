import { Module } from '@nestjs/common';

import { GroupsModule } from '@/groups/groups.module';

import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
  controllers: [UsersController],
  exports: [UsersService],
  imports: [GroupsModule],
  providers: [UsersService]
})
export class UsersModule {}
