import { EntityRepository } from '@douglasneuroinformatics/nestjs/core';

import { UserEntity } from './entities/user.entity';

export class UsersRepository extends EntityRepository(UserEntity) {
  deleteByUsername(username: string) {
    return super.deleteOne({ username });
  }
  findByUsername(username: string) {
    return super.findOne({ username });
  }
}
