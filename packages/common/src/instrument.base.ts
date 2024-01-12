import _ from 'lodash';
import { z } from 'zod';

import { $Language, $ZodTypeAny, type Language } from './core';

export type InstrumentKind = 'FORM' | 'INTERACTIVE' | 'UNKNOWN';
export const $InstrumentKind = z.enum(['FORM', 'INTERACTIVE', 'UNKNOWN']) satisfies z.ZodType<InstrumentKind>;

/**
 * The language(s) of the instrument. For a unilingual instrument,
 * this is a literal string. Otherwise, it is an array of all
 * languages the instrument may be completed in.
 */
export type InstrumentLanguage = Language | Language[];

export const $InstrumentLanguage = <T extends InstrumentLanguage>(language?: T) => {
  let schema: z.ZodTypeAny;
  if (Array.isArray(language)) {
    schema = z.array($Language);
  } else if (language === 'en') {
    schema = z.literal('en');
  } else if (language === 'fr') {
    schema = z.literal('fr');
  } else {
    schema = z.union([$Language, z.array($Language)]);
  }
  return schema as z.ZodType<T>;
};

/**
 * Utility type used to for UI fields in an instrument. If `L` is an array,
 * then resolves to `Record<K, V>`, otherwise resolves to `V` (i.e., in the
 * case of a unilingual instrument).
 *
 * @typeParam TLanguage - the language(s) of the instrument
 * @typeParam TValue - the value to be displayed in the UI
 */
export type InstrumentUIOption<TLanguage extends InstrumentLanguage, TValue> = TLanguage extends Language
  ? TValue
  : TLanguage extends (infer K extends Language)[]
    ? Record<K, TValue>
    : never;

export const $InstrumentUIOption = <TLanguage extends InstrumentLanguage, TSchema extends z.ZodTypeAny>(
  schema: TSchema,
  language?: TLanguage
) => {
  let resolvedSchema: z.ZodTypeAny = z.never();
  if (typeof language === 'string') {
    resolvedSchema = schema;
  } else if (typeof language === 'object') {
    const shape = Object.fromEntries(_.uniq(language).map((val) => [val, schema]));
    resolvedSchema = z.object(shape);
  } else if (typeof language === 'undefined') {
    resolvedSchema = z.union([
      schema,
      z.object({
        en: schema,
        fr: schema
      })
    ]);
  }
  return resolvedSchema as z.ZodType<InstrumentUIOption<TLanguage, z.output<TSchema>>>;
};

/**
 * An object containing the base details of any instrument to be displayed to the user. This may be
 * augmented in specific kinds of instruments, if applicable.
 *
 * @typeParam TLanguage - the language(s) of the instrument
 */
export type BaseInstrumentDetails<TLanguage extends InstrumentLanguage = InstrumentLanguage> = {
  /** A brief description of the instrument, such as the purpose and history of the instrument */
  description: InstrumentUIOption<TLanguage, string>;

  /** The title of the instrument in the language it is written, omitting the definite article */
  title: InstrumentUIOption<TLanguage, string>;
};

export const $BaseInstrumentDetails = <TLanguage extends InstrumentLanguage>(language?: TLanguage) => {
  return z.object({
    description: $InstrumentUIOption(z.string().min(1), language),
    title: $InstrumentUIOption(z.string().min(1), language)
  }) as z.ZodType<BaseInstrumentDetails<TLanguage>>;
};

/** An object with additional details relevant to multiple categories of instrument  */
export type EnhancedBaseInstrumentDetails<TLanguage extends InstrumentLanguage = InstrumentLanguage> =
  BaseInstrumentDetails<TLanguage> & {
    /** An integer representing the estimated number of minutes for the average target subject to complete the instrument */
    estimatedDuration: number;
    /** Brief sequential instructions for how the subject should complete the instrument. */
    instructions: InstrumentUIOption<TLanguage, string[]>;
  };

export const $EnhancedBaseInstrumentDetails = <TLanguage extends InstrumentLanguage>(language?: TLanguage) => {
  return $BaseInstrumentDetails(language).and(
    z.object({
      estimatedDuration: z.number().int().nonnegative(),
      instructions: $InstrumentUIOption(z.array(z.string().min(1)), language)
    })
  ) as z.ZodType<EnhancedBaseInstrumentDetails<TLanguage>>;
};

/**
 * The basic properties common to all instruments. Specific types of instruments (e.g., form, interactive)
 * extend this type and are discriminated according to the `kind` property.
 *
 * @typeParam TData - the structure of the data derived from this instrument
 * @typeParam TLanguage - the language(s) of the instrument
 */
export type BaseInstrument<TData = unknown, TLanguage extends InstrumentLanguage = InstrumentLanguage> = {
  /** The content in the instrument to be rendered to the user */
  content?: unknown;

  /** The details of the instrument to be displayed to the user */
  details: BaseInstrumentDetails<TLanguage>;

  id?: string;

  /** The discriminator key for the type of instrument */
  kind: InstrumentKind;

  /** The language(s) in which the instrument is written */
  language: TLanguage;
  /** Arbitrary measures derived from the data */
  measures?: unknown;

  /** The name of the instrument, which must be unique for a given version */
  name: string;

  /** A list of tags that users can use to filter instruments */
  tags: InstrumentUIOption<TLanguage, string[]>;

  /** The zod validation schema for the instrument data */
  validationSchema: z.ZodType<TData>;

  /** The version of the instrument */
  version: number;
};

export const $BaseInstrument = <TLanguage extends InstrumentLanguage>(language?: TLanguage) => {
  return z.object({
    content: z.unknown(),
    details: $BaseInstrumentDetails(language),
    id: z.string().optional(),
    kind: $InstrumentKind,
    language: $InstrumentLanguage(language),
    measures: z.unknown().optional(),
    name: z.string().min(1),
    tags: $InstrumentUIOption(z.array(z.string().min(1)), language),
    validationSchema: $ZodTypeAny,
    version: z.number()
  });
};

/**
 * An object containing the essential data describing an instrument, but omitting the content
 * and validation schema required to actually complete the instrument. This may be used for,
 * among other things, displaying available instruments to the user.
 */
export type BaseInstrumentSummary<T extends BaseInstrument = BaseInstrument> = Omit<
  T,
  'content' | 'validationSchema'
> & {
  id: string;
};

export const $BaseInstrumentSummary = $BaseInstrument()
  .omit({
    content: true,
    validationSchema: true
  })
  .extend({ id: z.string() }) satisfies z.ZodType<BaseInstrumentSummary>;

export type CreateInstrumentData = z.infer<typeof $CreateInstrumentData>;
export const $CreateInstrumentData = z.object({
  kind: $InstrumentKind.optional(),
  source: z.string().min(1)
});

export type InstrumentSourceContainer = z.infer<typeof $InstrumentSourceContainer>;
export const $InstrumentSourceContainer = z.object({
  id: z.string(),
  name: z.string(),
  source: z.string(),
  version: z.number()
});

export type InstrumentBundleContainer = z.infer<typeof $InstrumentBundleContainer>;
export const $InstrumentBundleContainer = z.object({
  bundle: z.string(),
  id: z.string()
});
