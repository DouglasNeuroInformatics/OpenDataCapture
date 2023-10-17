import { EntityRepository } from '@/base/entity.repository';

import { GroupEntity } from './entities/group.entity';

export class GroupsRepository extends EntityRepository(GroupEntity) {}
