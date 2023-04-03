import { MongoAbility, RawRuleOf } from '@casl/ability';

import { Group } from '../../groups';

export type AppAction = 'create' | 'read' | 'update' | 'delete' | 'manage';

export type AppSubject = 'Group' | Group | 'User' | 'Subject' | 'Instrument' | 'InstrumentRecord' | 'all';

export type AppAbility = MongoAbility<[AppAction, AppSubject]>;

export type Permissions = RawRuleOf<AppAbility>[];
