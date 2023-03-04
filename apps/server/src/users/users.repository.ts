import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import { Model, UpdateQuery } from 'mongoose';

import { User, UserDocument } from './schemas/user.schema';

import { EntityRepository } from '@/core/entity.repository';

@Injectable()
export class UsersRepository extends EntityRepository<User> {
  constructor(@InjectModel(User.name) userModel: Model<UserDocument>) {
    super(userModel);
  }

  async updateUser(username: string, updateQuery: UpdateQuery<unknown>): Promise<UserDocument | null> {
    return this.entityModel.findOneAndUpdate({ username }, updateQuery, { new: true });
  }

  async removeUser(username: string): Promise<UserDocument | null> {
    return this.entityModel.findOneAndRemove({ username });
  }
}
