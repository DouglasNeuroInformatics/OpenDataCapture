import { Module } from '@nestjs/common';

import { PrismaModule } from '@/prisma/prisma.module';

import { GroupsController } from './groups.controller';
import { GroupsService } from './groups.service';

@Module({
  controllers: [GroupsController],
  exports: [GroupsService],
  imports: [
    PrismaModule.forFeature('Group')
  ],
  providers: [GroupsService]
})
export class GroupsModule {}
