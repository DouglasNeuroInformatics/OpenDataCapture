import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { GroupEntity, GroupSchema } from './entities/group.entity';
import { GroupsController } from './groups.controller';
import { GroupsService } from './groups.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: GroupEntity.modelName,
        schema: GroupSchema
      }
    ])
  ],
  controllers: [GroupsController],
  providers: [GroupsService],
  exports: [GroupsService]
})
export class GroupsModule {}
