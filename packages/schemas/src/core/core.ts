import type { PureAbility, RawRuleOf } from '@casl/ability';
import { licenses } from '@opendatacapture/licenses';
import type { LicenseIdentifier } from '@opendatacapture/licenses';
import type { Language as InstrumentAuthoringLanguage, Json, JsonLiteral } from '@opendatacapture/runtime-core';
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
  'InstrumentRepo',
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

/**
 * Every language the interface may be displayed in, in the order they are offered to a user.
 * This is the source the frontends derive from: `packages/react-core/src/types.ts` enables
 * exactly these in libui, so a language added here is offered by `apps/web` and `apps/gateway`
 * without any further edit.
 *
 * Narrower than the set an *instrument* may be authored in — see {@link $InstrumentAuthoringLanguage}.
 */
export const LANGUAGES = ['en', 'es', 'fr'] as const;

export type Language = (typeof LANGUAGES)[number];
export const $Language = z.enum(LANGUAGES);

/**
 * The languages an instrument may be authored in. `@opendatacapture/runtime-core` owns this set,
 * and it is deliberately not {@link LANGUAGES}: an interface language is something a user reads
 * the application in, whereas this is a language clinical content exists in. A user reading the
 * interface in a language no instrument offers is served that instrument in the language it was
 * written in — see `translateInstrument` in `@opendatacapture/instrument-utils`.
 */
export const $InstrumentAuthoringLanguage: z.ZodType<InstrumentAuthoringLanguage> = z.enum(['en', 'fr']);

/**
 * The language to tag content a user is authoring right now, given the language they are reading
 * the interface in. Content typed by a user whose interface language instruments do not support is
 * recorded as English rather than rejected — the alternative is refusing to let them author at all.
 *
 * This is the one place that policy is decided; widening the authoring languages retires it.
 */
export const toInstrumentAuthoringLanguage = (language: Language): InstrumentAuthoringLanguage => {
  const authoring = $InstrumentAuthoringLanguage.safeParse(language);
  return authoring.success ? authoring.data : 'en';
};

/**
 * A string authored in each of the application's languages. Every field is nullish so content
 * may target a single language, and nullish rather than optional to match Prisma's
 * null-for-absent convention.
 *
 * The `satisfies` is what keeps this in step with {@link Language}: the shape must name every
 * language, so adding one to `Language` fails to compile until it is added here too.
 */
export type LocalizedString = z.infer<typeof $LocalizedString>;
export const $LocalizedString = z.object({
  en: z.string().nullish(),
  es: z.string().nullish(),
  fr: z.string().nullish()
} satisfies { [L in Language]: z.ZodType<null | string | undefined> });

/**
 * A {@link $LocalizedString} with at least one non-blank entry, for content a reader must
 * actually see — an email subject or body that renders as nothing is a broken message, not a
 * translation choice.
 */
export type AuthoredLocalizedString = z.infer<typeof $AuthoredLocalizedString>;
export const $AuthoredLocalizedString = $LocalizedString.refine(
  (localized) => Object.values(localized).some((entry) => typeof entry === 'string' && entry.trim().length > 0),
  'At least one language must have content'
);

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

export type { InstrumentAuthoringLanguage, Json };
