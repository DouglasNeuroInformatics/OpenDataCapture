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

export type BaseModel = z.infer<typeof $BaseModel>;
export const $BaseModel = z.object({
  createdAt: z.coerce.date(),
  id: z.string(),
  updatedAt: z.coerce.date()
});

export const $JsonLiteral = z.union([z.string(), z.number(), z.boolean(), z.null()]);

export type JsonLiteral = z.infer<typeof $JsonLiteral>;

export type Json = { [key: string]: Json } | Json[] | JsonLiteral;

export const $Json: z.ZodType<Json> = z.lazy(() => z.union([$JsonLiteral, z.array($Json), z.record($Json)]));

export type DistributiveOmit<T, K extends keyof any> = T extends any ? Omit<T, K> : never;

export function toLowerCase<T extends string>(s: T) {
  return s.toLowerCase() as Lowercase<T>;
}

export function toUpperCase<T extends string>(s: T) {
  return s.toUpperCase() as Uppercase<T>;
}

/** Used to determine if object is of type `ZodType` independent of specific instances or library versions */
export function isZodType(arg: unknown): arg is z.ZodTypeAny {
  const prototype = arg && typeof arg === 'object' ? Reflect.getPrototypeOf(arg.constructor) : null;
  return Boolean(prototype && Reflect.get(prototype, 'name') === 'ZodType');
}

export const $ZodTypeAny = z.custom<z.ZodTypeAny>((arg) => isZodType(arg));

export const $BooleanString = z.preprocess((arg) => {
  if (typeof arg === 'string') {
    if (arg.trim().toLowerCase() === 'true') {
      return true;
    } else if (arg.trim().toLowerCase() === 'false') {
      return false;
    }
  }
  return arg;
}, z.boolean());

export const $Uint8Array: z.ZodType<Uint8Array, z.ZodTypeDef, Uint8Array | number[]> = z
  .union([z.array(z.number().int().min(0).max(255)), z.instanceof(Uint8Array)])
  .transform((arg) => {
    if (Array.isArray(arg)) {
      return new Uint8Array(arg);
    }
    return arg;
  });
