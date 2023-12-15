import type { PureAbility, RawRuleOf } from '@casl/ability';
import { z } from 'zod';

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

export const $Language = z.enum(['en', 'fr']);

export type Language = z.infer<typeof $Language>;

export const $ValidObjectId = z.string().refine((s) => new Blob([s]).size === 24);

export const $BaseModel = z.object({
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  id: $ValidObjectId
});
