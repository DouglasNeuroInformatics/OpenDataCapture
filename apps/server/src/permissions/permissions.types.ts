import { InferSubjects, MongoQuery, PureAbility, RawRuleOf } from '@casl/ability';

import { Group } from '@/groups/schemas/group.schema';
import { User } from '@/users/schemas/user.schema';

export type Action = 'manage' | 'create' | 'read' | 'update' | 'delete';

export type Subject = InferSubjects<typeof Group | typeof User | 'all', true>;

export type AppAbility = PureAbility<[Action, Subject], MongoQuery>;

export type Permissions = RawRuleOf<AppAbility>[];

export type DefaultPermissionLevel = 'admin' | 'group-manager' | 'standard';
