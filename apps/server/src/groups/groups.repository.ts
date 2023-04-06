import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import { AccessibleModel } from '@casl/mongoose';
import { Model } from 'mongoose';

import { GroupDocument, GroupEntity } from './entities/group.entity';

import { EntityRepository } from '@/core/abstract/entity.repository';

@Injectable()
export class GroupsRepository extends EntityRepository<GroupEntity> {
  constructor(@InjectModel(GroupEntity.modelName) groupModel: Model<GroupDocument, AccessibleModel<GroupDocument>>) {
    super(groupModel);
  }
}
