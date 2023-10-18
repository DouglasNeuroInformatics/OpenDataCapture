import { EntityRepository } from '@douglasneuroinformatics/nestjs/core';

import { GroupEntity } from './entities/group.entity';

export class GroupsRepository extends EntityRepository(GroupEntity) {}
