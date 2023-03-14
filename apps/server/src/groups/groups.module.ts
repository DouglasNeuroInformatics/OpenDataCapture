import { Module } from '@nestjs/common';
import { MongooseModule, SchemaFactory } from '@nestjs/mongoose';

import { GroupsController } from './groups.controller';
import { GroupsRepository } from './groups.repository';
import { GroupsService } from './groups.service';
import { Group, GroupSchema } from './schemas/group.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Group.name,
        schema: GroupSchema
      }
    ])
  ],
  controllers: [GroupsController],
  providers: [GroupsRepository, GroupsService],
  exports: [GroupsService]
})
export class GroupsModule {}
