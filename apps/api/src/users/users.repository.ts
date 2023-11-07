import { EntityRepository } from '@douglasneuroinformatics/nestjs/core';

import { UserEntity } from './entities/user.entity';

export class UsersRepository extends EntityRepository(UserEntity) {
  deleteByUsername(username: string) {
    return super.deleteOne({ username });
  }
  findByGroup(groupName: string) {
    return super.find({ groups: { name: groupName } });
  }
  findByUsername(username: string) {
    return super.findOne({ username });
  }
}
