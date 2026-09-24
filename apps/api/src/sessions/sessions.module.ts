import { Module } from '@nestjs/common';

import { GroupsModule } from '@/groups/groups.module';
import { SubjectsModule } from '@/subjects/subjects.module';
import { UsersModule } from '@/users/users.module';

import { SessionsController } from './sessions.controller';
import { SessionsService } from './sessions.service';

@Module({
  controllers: [SessionsController],
  exports: [SessionsService],
  imports: [GroupsModule, SubjectsModule, UsersModule],
  providers: [SessionsService]
})
export class SessionsModule {}
