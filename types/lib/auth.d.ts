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

export type LoginRequest = LoginCredentials & {
  fingerprint?: Fingerprint | null;
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
  isAdmin?: boolean;
  firstName?: string;
  lastName?: string;
  groups: Group[];
}

/** A subset of other things used to generate visitorId */
export type Fingerprint = {
  visitorId: string;
  language: string;
  screenResolution?: [number | null, number | null];
};
