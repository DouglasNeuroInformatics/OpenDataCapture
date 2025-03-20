import type { PureAbility, RawRuleOf } from '@casl/ability';
import { isObject } from '@douglasneuroinformatics/libjs';
import { licenses } from '@opendatacapture/licenses';
import type { LicenseIdentifier } from '@opendatacapture/licenses';
import type { Json, JsonLiteral, Language } from '@opendatacapture/runtime-core';
import type { Simplify } from 'type-fest';
import { z } from 'zod';

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

export type Permissions = RawRuleOf<BaseAppAbility>[];

export const $Language: z.ZodType<Language> = z.enum(['en', 'fr']);

export type BaseModel = z.infer<typeof $BaseModel>;
export const $BaseModel = z.object({
  createdAt: z.coerce.date(),
  id: z.string(),
  updatedAt: z.coerce.date()
});

export const $JsonLiteral: z.ZodType<JsonLiteral> = z.union([z.string(), z.number(), z.boolean(), z.null()]);

export const $Json: z.ZodType<Json> = z.lazy(() => z.union([$JsonLiteral, z.array($Json), z.record($Json)]));

export type DistributiveOmit<T, K extends keyof any> = T extends any ? Omit<T, K> : never;

/** Used to determine if object is of type `ZodType` independent of specific instances or library versions */
export function isZodType(arg: unknown): arg is z.ZodTypeAny {
  let prototype: null | object = null;
  if (isObject(arg) && isObject(arg.constructor)) {
    prototype = Reflect.getPrototypeOf(arg.constructor);
  }
  return Boolean(prototype && Reflect.get(prototype, 'name') === 'ZodType');
}

export function isZodObjectType(arg: z.ZodTypeAny): arg is z.AnyZodObject {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  return arg?._def?.typeName === 'ZodObject';
}

export const $ZodTypeAny = z.custom<z.ZodTypeAny>((arg) => isZodType(arg));

export const $BooleanString = z
  .string()
  .transform((arg) => {
    if (arg.trim().toLowerCase() === 'true') {
      return true;
    } else if (arg.trim().toLowerCase() === 'false') {
      return false;
    }
    return arg;
  })
  .pipe(z.boolean());

export const $Uint8Array: z.ZodType<Uint8Array, z.ZodTypeDef, number[] | Uint8Array> = z
  .union([z.array(z.number().int().min(0).max(255)), z.instanceof(Uint8Array)])
  .transform((arg) => {
    if (Array.isArray(arg)) {
      return new Uint8Array(arg);
    }
    return arg;
  });

export const $LicenseIdentifier = z.string().refine((arg) => licenses.has(arg as LicenseIdentifier)) as z.ZodType<
  LicenseIdentifier,
  z.ZodTypeDef,
  LicenseIdentifier
>;

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
