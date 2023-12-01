import type { PureAbility, RawRuleOf } from '@casl/ability';

export type AppAction = 'create' | 'delete' | 'manage' | 'read' | 'update';

export type AppSubject =
  | 'all'
  | 'Assignment'
  | 'Group'
  | 'Instrument'
  | 'InstrumentRecord'
  | 'Subject'
  | 'Summary'
  | 'User'
  | 'Visit';

export type AppAbility = PureAbility<[AppAction, AppSubject]>;

export type Permissions = RawRuleOf<AppAbility>[];

export type Language = 'en' | 'fr';
