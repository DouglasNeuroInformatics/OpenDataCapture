import { MongoAbility, RawRuleOf } from '@casl/ability';

import { Group } from './group';
import { Subject } from './subject';
import { User } from './user';

export type AuthPayload = {
  accessToken: string;
};

export type LoginCredentials = {
  username: string;
  password: string;
};

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

export type JwtPayload = {
  username: string;
  permissions: Permissions;
  firstName?: string;
  lastName?: string;
  groups: Group[];
}
