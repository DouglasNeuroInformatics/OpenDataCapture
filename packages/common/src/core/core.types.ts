import type { PureAbility, RawRuleOf } from '@casl/ability';

export type AppAction = 'create' | 'delete' | 'manage' | 'read' | 'update';

export type AppSubjectName =
  | 'Assignment'
  | 'Group'
  | 'Instrument'
  | 'InstrumentRecord'
  | 'Subject'
  | 'Summary'
  | 'User'
  | 'Visit'
  | 'all';

export type BaseAppAbility = PureAbility<[AppAction, AppSubjectName]>;

export type Permissions = RawRuleOf<BaseAppAbility>[];

export type Language = 'en' | 'fr';
