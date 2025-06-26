import type { PureAbility, RawRuleOf } from '@casl/ability';
import { licenses } from '@opendatacapture/licenses';
import type { LicenseIdentifier } from '@opendatacapture/licenses';
import type { Json, JsonLiteral, Language } from '@opendatacapture/runtime-core';
import type { Simplify } from 'type-fest';
import { z } from 'zod/v4';

export const DEFAULT_GROUP_NAME = 'root';

export type AppAction = z.infer<typeof $AppAction>;
export const $AppAction = z.enum(['create', 'delete', 'manage', 'read', 'update']);

export type AppSubjectName = z.infer<typeof $AppSubjectName>;
export const $AppSubjectName = z.enum([
  'all',
  'Assignment',
  'Group',
  'Instrument',
  'InstrumentRecord',
  'Session',
  'Subject',
  'User'
]);

export type BaseAppAbility = PureAbility<[AppAction, AppSubjectName]>;

export type UserPermission = z.infer<typeof $UserPermission>;
export const $UserPermission = z.object({
  action: $AppAction,
  subject: $AppSubjectName
}) satisfies z.ZodType<RawRuleOf<BaseAppAbility>>;

export type Permissions = z.infer<typeof $Permissions>;
export const $Permissions = z.array($UserPermission);

export const $Language: z.ZodType<Language> = z.enum(['en', 'fr']);

export type BaseModel = z.infer<typeof $BaseModel>;
export const $BaseModel = z.object({
  createdAt: z.coerce.date(),
  id: z.string(),
  updatedAt: z.coerce.date()
});

export const $JsonLiteral: z.ZodType<JsonLiteral> = z.union([z.string(), z.number(), z.boolean(), z.null()]);

export const $Json: z.ZodType<Json> = z.lazy(() =>
  z.union([$JsonLiteral, z.array($Json), z.record(z.string(), $Json)])
);

export type DistributiveOmit<T, K extends keyof any> = T extends any ? Omit<T, K> : never;

export const $LicenseIdentifier = z
  .string()
  .refine((arg) => licenses.has(arg as LicenseIdentifier)) as z.ZodType<LicenseIdentifier>;

export type WithID<T extends { [key: string]: any }> = Simplify<T & { id: string }>;

export const $Error: z.ZodType<Error> = z.object({
  cause: z.unknown(),
  message: z.string(),
  name: z.string(),
  stack: z.string().optional()
});

export const $RegexString = z.string().refine(
  (arg) => {
    try {
      new RegExp(arg);
    } catch {
      return false;
    }
    return true;
  },
  { message: 'Invalid regular expression' }
);

export type { Json, Language };
