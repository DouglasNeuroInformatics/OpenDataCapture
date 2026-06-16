import { Module } from '@nestjs/common';

import { GroupsController } from './groups.controller';
import { GroupsService } from './groups.service';

@Module({
  controllers: [GroupsController],
  exports: [GroupsService],
  providers: [GroupsService]
})
export class GroupsModule {}
