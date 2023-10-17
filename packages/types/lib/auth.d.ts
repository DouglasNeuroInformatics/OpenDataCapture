import { MongoAbility, RawRuleOf } from '@casl/ability';
import type { Class } from 'type-fest';

import type { Assignment } from './assignment';
import type { Group } from './group';
import type { Instrument } from './instrument';
import type { InstrumentRecord } from './instrument-record';
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

export type AppEntityType<T> = T extends object ? Omit<T, 'id'> : never;

export type AppEntity = AppEntityType<Assignment | Group | Instrument | InstrumentRecord | Subject | Summary | User>;

export type AppEntityName = 'Assignment' | 'Group' | 'Instrument' | 'InstrumentRecord' | 'Subject' | 'Summary' | 'User';

export type AppEntityClass<TEntity extends AppEntity> = Class<TEntity> & {
  readonly modelName: AppEntityName;
};

export type AppSubject = 'all' | AppEntity | AppEntityName;

export type AppAbility = MongoAbility<[AppAction, AppSubject]>;

export type Permissions = RawRuleOf<AppAbility>[];

export type JwtPayload = {
  firstName?: string;
  groups: Group[];
  lastName?: string;
  permissions: Permissions;
  username: string;
};
