import { Module } from '@nestjs/common';

import { GroupsModule } from '@/groups/groups.module';
import { PrismaModule } from '@/prisma/prisma.module';
import { SubjectsModule } from '@/subjects/subjects.module';

import { SessionsController } from './sessions.controller';
import { SessionsService } from './sessions.service';

@Module({
  controllers: [SessionsController],
  exports: [SessionsService],
  imports: [GroupsModule, PrismaModule.forFeature('Session'), SubjectsModule],
  providers: [SessionsService]
})
export class SessionsModule {}
