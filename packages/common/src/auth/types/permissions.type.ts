import { MongoAbility, RawRuleOf } from '@casl/ability';

import { Group } from '@/groups';
import { Subject } from '@/subjects';
import { User } from '@/users';

export type AppAction = 'create' | 'read' | 'update' | 'delete' | 'manage';

export type AppSubject =
  | 'Group'
  | Group
  | 'User'
  | User
  | 'Subject'
  | Subject
  | 'Instrument'
  | 'InstrumentRecord'
  | 'all';

export type AppAbility = MongoAbility<[AppAction, AppSubject]>;

export type Permissions = RawRuleOf<AppAbility>[];
