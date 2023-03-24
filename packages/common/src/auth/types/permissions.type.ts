import { MongoAbility, RawRuleOf } from '@casl/ability';

import { Group } from '@/groups';

export type Action = 'create' | 'read' | 'update' | 'delete' | 'manage';

export type Subject = 'Group' | Group | 'User' | 'Subject' | 'Instrument' | 'all';

export type AppAbility = MongoAbility<[Action, Subject]>;

export type Permissions = RawRuleOf<AppAbility>[];
