import { createMongoAbility } from '@casl/ability';

import { Actions, Subjects } from './permissions.types';

import { Group } from '@/groups/entities/group.entity';
import { User } from '@/users/entities/user.entity';

const ability = createMongoAbility<[Actions, Subjects]>([
  {
    action: 'create',
    subject: 'Group'
  },
  {
    action: 'delete',
    subject: Group
  }
]);

ability.can('create', User);

export default ability;
