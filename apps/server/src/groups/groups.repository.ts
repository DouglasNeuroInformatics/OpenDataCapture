import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import { AccessibleModel } from '@casl/mongoose';
import { Model } from 'mongoose';

import { Group, GroupDocument } from './entities/group.entity';

import { EntityRepository } from '@/core/entity.repository';

@Injectable()
export class GroupsRepository extends EntityRepository<Group> {
  constructor(@InjectModel(Group.name) groupModel: Model<GroupDocument, AccessibleModel<GroupDocument>>) {
    super(groupModel);
  }
}
