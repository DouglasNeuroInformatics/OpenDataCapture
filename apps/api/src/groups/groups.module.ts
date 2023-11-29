import { DatabaseModule } from '@douglasneuroinformatics/nestjs/modules';
import { Module } from '@nestjs/common';

import { GroupEntity } from './entities/group.entity';
import { GroupsController } from './groups.controller';
import { GroupsService } from './groups.service';

@Module({
  controllers: [GroupsController],
  exports: [GroupsService],
  imports: [DatabaseModule.forFeature([GroupEntity])],
  providers: [GroupsService]
})
export class GroupsModule {}
