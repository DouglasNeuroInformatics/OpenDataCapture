import { Module } from '@nestjs/common';

import { GroupsModule } from '@/groups/groups.module';
import { MailModule } from '@/mail/mail.module';

import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
  controllers: [UsersController],
  exports: [UsersService],
  imports: [GroupsModule, MailModule],
  providers: [UsersService]
})
export class UsersModule {}
