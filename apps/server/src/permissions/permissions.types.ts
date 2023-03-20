import { InferSubjects, MongoAbility, RawRuleOf } from '@casl/ability';

import { Group } from '@/groups/schemas/group.schema';
import { User } from '@/users/schemas/user.schema';

export type Action = 'manage' | 'create' | 'read' | 'update' | 'delete';

export type Subject = InferSubjects<typeof Group | typeof User | 'all', true>;

export type AppAbility = MongoAbility<[Action, Subject]>;

export type Permissions = RawRuleOf<AppAbility>[];

export type BasePermissionLevel = 'admin' | 'group-manager' | 'standard';
