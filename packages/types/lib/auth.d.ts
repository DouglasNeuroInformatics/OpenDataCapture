import { MongoAbility, RawRuleOf } from '@casl/ability';

import type { Assignment } from './assignment';
import type { Group } from './group';
import type { Subject } from './subject';
import type { Summary } from './summary';
import type { User } from './user';

export type AuthPayload = {
  accessToken: string;
};

export type LoginCredentials = {
  password: string;
  username: string;
};

export type AppAction = 'create' | 'delete' | 'manage' | 'read' | 'update';

export type AppSubject =
  | 'Assignment'
  | 'Group'
  | 'Instrument'
  | 'InstrumentRecord'
  | 'Subject'
  | 'Summary'
  | 'User'
  | 'all'
  | Assignment
  | Group
  | Subject
  | Summary
  | User;

export type AppAbility = MongoAbility<[AppAction, AppSubject]>;

export type Permissions = RawRuleOf<AppAbility>[];

export type JwtPayload = {
  firstName?: string;
  groups: Group[];
  lastName?: string;
  permissions: Permissions;
  username: string;
};
