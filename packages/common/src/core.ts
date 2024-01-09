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

export const $BaseModel = z.object({
  createdAt: z.coerce.date(),
  id: z.string(),
  updatedAt: z.coerce.date()
});

export const $JsonLiteral = z.union([z.string(), z.number(), z.boolean(), z.null()]);

export type JsonLiteral = z.infer<typeof $JsonLiteral>;

export type Json = { [key: string]: Json } | Json[] | JsonLiteral;

export const $Json: z.ZodType<Json> = z.lazy(() => z.union([$JsonLiteral, z.array($Json), z.record($Json)]));
