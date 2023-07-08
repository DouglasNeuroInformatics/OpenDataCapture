import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import { AccessibleModel } from '@casl/mongoose';
import { Model } from 'mongoose';

import { UserDocument, UserEntity } from './entities/user.entity.js';

import { EntityRepository } from '@/core/abstract/entity.repository.js';

@Injectable()
export class UsersRepository extends EntityRepository<UserEntity> {
  constructor(@InjectModel(UserEntity.modelName) userModel: Model<UserDocument, AccessibleModel<UserDocument>>) {
    super(userModel);
  }
}
