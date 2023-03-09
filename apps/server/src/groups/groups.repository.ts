import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import { Model } from 'mongoose';

import { Group, GroupDocument } from './schemas/group.schema';

import { EntityRepository } from '@/core/entity.repository';

@Injectable()
export class GroupsRepository extends EntityRepository<Group> {
  constructor(@InjectModel(Group.name) groupModel: Model<GroupDocument>) {
    super(groupModel);
  }
}
