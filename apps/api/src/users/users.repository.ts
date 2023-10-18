import { EntityRepository } from '@douglasneuroinformatics/nestjs/core';

import { UserEntity } from './entities/user.entity';

export class UsersRepository extends EntityRepository(UserEntity) {}
