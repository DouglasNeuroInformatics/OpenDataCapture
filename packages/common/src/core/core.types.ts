import type { MongoAbility, RawRuleOf } from '@casl/ability';
import type { Class } from 'type-fest';

import type { Assignment } from '../assignment/assignment.types';
import type { Group } from '../group/group.types';
import type { Instrument } from '../instrument/instrument.types';
import type { InstrumentRecord } from '../instrument/instrument-record.types';
import type { Subject } from '../subject/subject.types';
import type { Summary } from '../summary/summary.types';
import type { User } from '../user/user.types';
import type { Visit } from '../visit/visit.types';

export type AppAction = 'create' | 'delete' | 'manage' | 'read' | 'update';

export type AppEntityType<T> = T extends object ? Omit<T, 'id'> : never;

export type AppEntity = AppEntityType<
  Assignment | Group | Instrument | InstrumentRecord | Subject | Summary | User | Visit
>;

export type AppEntityName =
  | 'Assignment'
  | 'Group'
  | 'Instrument'
  | 'InstrumentRecord'
  | 'Subject'
  | 'Summary'
  | 'User'
  | 'Visit';

export type AppEntityClass<TEntity extends AppEntity> = Class<TEntity> & {
  readonly modelName: AppEntityName;
};

export type AppSubject = 'all' | AppEntity | AppEntityName;

export type AppAbility = MongoAbility<[AppAction, AppSubject]>;

export type Permissions = RawRuleOf<AppAbility>[];

export type Language = 'en' | 'fr';
