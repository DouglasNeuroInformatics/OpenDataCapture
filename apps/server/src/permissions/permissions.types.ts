import { InferSubjects, PureAbility } from '@casl/ability';

import { Group } from '@/groups/entities/group.entity';
import { User } from '@/users/entities/user.entity';

export type Action = 'manage' | 'create' | 'read' | 'update' | 'delete';

export type Subject = InferSubjects<typeof Group | typeof User | 'all', true>;

export type AppAbility = PureAbility<[Action, Subject]>;
