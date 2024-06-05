import { isUnique } from '@douglasneuroinformatics/libjs';
import type { LicenseIdentifier } from '@opendatacapture/licenses';
import type { ConditionalKeys, Simplify, ValueOf } from 'type-fest';
import { z } from 'zod';

import { $Language, $LicenseIdentifier, $Uint8Array, $ZodTypeAny, type Language } from '../core/core.js';

export type InstrumentKind = z.infer<typeof $InstrumentKind>;
export const $InstrumentKind = z.enum(['FORM', 'INTERACTIVE', 'SERIES', 'UNKNOWN']);

/**
 * The language(s) of the instrument. For a unilingual instrument,
 * this is a literal string. Otherwise, it is an array of all
 * languages the instrument may be completed in.
 */
export type InstrumentLanguage = Language | Language[];
export const $InstrumentLanguage = z.union([
  $Language,
  z
    .array($Language)
    .nonempty()
    .refine((arr) => isUnique(arr), {
      message: 'Array must contain unique values'
    })
]) satisfies z.ZodType<InstrumentLanguage>;

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
  : TLanguage extends (infer L extends Language)[]
    ? { [K in L]: TValue }
    : never;
export const $$InstrumentUIOption = <TSchema extends z.ZodTypeAny, TLanguage extends InstrumentLanguage>(
  $Schema: TSchema,
  language?: TLanguage
): z.ZodType<InstrumentUIOption<TLanguage, z.infer<TSchema>>> => {
  let resolvedSchema: z.ZodTypeAny = z.never();
  if (typeof language === 'string') {
    resolvedSchema = $Schema;
  } else if (typeof language === 'object') {
    if (!isUnique(language)) {
      throw new Error(`Array of languages must contain only unique values: ${language.join(', ')}`);
    }
    const shape = Object.fromEntries(language.map((val) => [val, $Schema]));
    resolvedSchema = z.object(shape);
  } else if (typeof language === 'undefined') {
    resolvedSchema = z.union([
      $Schema,
      z.object({
        en: $Schema,
        fr: $Schema
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
export type InstrumentDetails<TLanguage extends InstrumentLanguage = InstrumentLanguage> = {
  /** The legal person(s) that created the instrument and hold copyright to the instrument */
  authors?: null | string[];

  /** A brief description of the instrument, such as the purpose and history of the instrument */
  description: InstrumentUIOption<TLanguage, string>;

  /** An integer representing the estimated number of minutes for the average target subject to complete the instrument */
  estimatedDuration?: number;

  /** Brief sequential instructions for how the subject should complete the instrument. */
  instructions?: InstrumentUIOption<TLanguage, string[]>;

  /** An identifier corresponding to the SPDX license list version d2709ad (released on 2024-01-30) */
  license: LicenseIdentifier;

  /** An reference link where the user can learn more about the instrument */
  referenceUrl?: null | string;

  /** A URL where the user can find the source code for the instrument */
  sourceUrl?: null | string;

  /** The title of the instrument in the language it is written, omitting the definite article */
  title: InstrumentUIOption<TLanguage, string>;
};
export const $InstrumentDetails = z.object({
  authors: z.array(z.string()).nullish(),
  description: $$InstrumentUIOption(z.string().min(1)),
  estimatedDuration: z.number().int().nonnegative().optional(),
  instructions: $$InstrumentUIOption(z.array(z.string().min(1))).optional(),
  license: $LicenseIdentifier,
  referenceUrl: z.string().url().nullish(),
  sourceUrl: z.string().url().nullish(),
  title: $$InstrumentUIOption(z.string().min(1))
}) satisfies z.ZodType<InstrumentDetails>;

export type UnilingualInstrumentDetails = InstrumentDetails<Language>;
export const $UnilingualInstrumentDetails = $InstrumentDetails.extend({
  description: z.string().min(1),
  instructions: z.array(z.string().min(1)).optional(),
  title: z.string().min(1)
}) satisfies z.ZodType<UnilingualInstrumentDetails>;

export type InstrumentMeasureValue = z.infer<typeof $InstrumentMeasureValue>;
export const $InstrumentMeasureValue = z.union([z.string(), z.boolean(), z.number(), z.date(), z.undefined()]);

export type InstrumentMeasure<TData = any, TLanguage extends InstrumentLanguage = InstrumentLanguage> =
  | {
      hidden?: boolean;
      kind: 'computed';
      label: InstrumentUIOption<TLanguage, string>;
      value: (data: TData) => InstrumentMeasureValue;
    }
  | {
      hidden?: boolean;
      kind: 'const';
      label?: InstrumentUIOption<TLanguage, string>;
      ref: TData extends { [key: string]: any }
        ? ConditionalKeys<TData, InstrumentMeasureValue> extends infer K
          ? [K] extends [never]
            ? string
            : K
          : never
        : never;
    };
export type InstrumentMeasures<TData = any, TLanguage extends InstrumentLanguage = InstrumentLanguage> = {
  [key: string]: InstrumentMeasure<TData, TLanguage>;
};

export type UnilingualInstrumentMeasures<TData = any> = InstrumentMeasures<TData, Language>;
export type MultilingualInstrumentMeasures<TData = any> = InstrumentMeasures<TData, Language[]>;

const $ComputeMeasureFunction = z.function().args(z.any()).returns($InstrumentMeasureValue);

const $ComputedInstrumentMeasure = z.object({
  hidden: z.boolean().optional(),
  kind: z.literal('computed'),
  label: $$InstrumentUIOption(z.string()),
  value: $ComputeMeasureFunction
}) satisfies z.ZodType<Extract<ValueOf<InstrumentMeasures>, { kind: 'computed' }>>;

const $UnilingualComputedInstrumentMeasure = z.object({
  hidden: z.boolean().optional(),
  kind: z.literal('computed'),
  label: z.string(),
  value: $ComputeMeasureFunction
}) satisfies z.ZodType<Extract<ValueOf<InstrumentMeasures<any, Language>>, { kind?: 'computed' }>>;

const $ConstantInstrumentMeasure = z.object({
  hidden: z.boolean().optional(),
  kind: z.literal('const'),
  label: $$InstrumentUIOption(z.string()).optional(),
  ref: z.string()
}) satisfies z.ZodType<Extract<ValueOf<InstrumentMeasures>, { kind?: 'const' }>>;

const $UnilingualConstantInstrumentMeasure = z.object({
  hidden: z.boolean().optional(),
  kind: z.literal('const'),
  label: z.string().optional(),
  ref: z.string()
}) satisfies z.ZodType<Extract<ValueOf<InstrumentMeasures<any, Language>>, { kind?: 'const' }>>;

export const $InstrumentMeasures = z.record(
  z.union([$ComputedInstrumentMeasure, $ConstantInstrumentMeasure])
) satisfies z.ZodType<InstrumentMeasures>;

export const $UnilingualInstrumentMeasures = z.record(
  z.union([$UnilingualComputedInstrumentMeasure, $UnilingualConstantInstrumentMeasure])
) satisfies z.ZodType<UnilingualInstrumentMeasures>;

/**
 * The basic properties common to all instruments. Specific types of instruments (e.g., form, interactive)
 * extend this type and are discriminated according to the `kind` property.
 *
 * @typeParam TData - the structure of the data derived from this instrument
 * @typeParam TLanguage - the language(s) of the instrument
 */
export type BaseInstrument<TData = any, TLanguage extends InstrumentLanguage = InstrumentLanguage> = {
  /** The content in the instrument to be rendered to the user */
  content?: unknown;

  /** The details of the instrument to be displayed to the user */
  details: InstrumentDetails<TLanguage>;

  /** The internal version of the instrument (a positive integer) */
  edition: number;

  id?: string;

  /** The discriminator key for the type of instrument */
  kind: InstrumentKind;

  /** The language(s) in which the instrument is written */
  language: TLanguage;

  /** Arbitrary measures derived from the data */
  measures: InstrumentMeasures<TData, TLanguage> | null;

  /** The name of the instrument, which must be unique for a given version */
  name: string;

  /** A list of tags that users can use to filter instruments */
  tags: InstrumentUIOption<TLanguage, string[]>;

  /** The zod validation schema for the instrument data */
  validationSchema: z.ZodType<TData>;
};

export const $BaseInstrument = z.object({
  content: z.any(),
  details: $InstrumentDetails,
  edition: z.number().int().positive(),
  id: z.string().optional(),
  kind: $InstrumentKind,
  language: $InstrumentLanguage,
  measures: $InstrumentMeasures.nullable(),
  name: z.string().min(1),
  tags: $$InstrumentUIOption(z.array(z.string().min(1))),
  validationSchema: $ZodTypeAny
}) satisfies z.ZodType<BaseInstrument>;

export const $UnilingualBaseInstrument = $BaseInstrument.extend({
  details: $UnilingualInstrumentDetails,
  language: $Language,
  measures: $UnilingualInstrumentMeasures.nullable(),
  tags: z.array(z.string().min(1))
}) satisfies z.ZodType<BaseInstrument<any, Language>>;

/**
 * An object containing the essential data describing an instrument, but omitting the content
 * and validation schema required to actually complete the instrument. This may be used for,
 * among other things, displaying available instruments to the user.
 */
export type InstrumentSummary<T extends BaseInstrument = BaseInstrument> = {
  id: string;
} & Omit<T, 'content' | 'measures' | 'validationSchema'>;

export type UnilingualInstrumentSummary = Simplify<InstrumentSummary<BaseInstrument<any, Language>>>;

export type MultilingualInstrumentSummary = Simplify<InstrumentSummary<BaseInstrument<any, Language[]>>>;

export const $InstrumentSummary = $BaseInstrument
  .omit({
    content: true,
    measures: true,
    validationSchema: true
  })
  .extend({ id: z.string() }) satisfies z.ZodType<InstrumentSummary>;

export type CreateInstrumentData = z.infer<typeof $CreateInstrumentData>;
export const $CreateInstrumentData = z.object({
  inputs: z.array(
    z.object({
      content: z.union([$Uint8Array, z.string()]),
      name: z.string()
    })
  ),
  kind: $InstrumentKind.optional()
});

export type InstrumentBundleContainer = z.infer<typeof $InstrumentBundleContainer>;
export const $InstrumentBundleContainer = z.object({
  bundle: z.string(),
  id: z.string()
});
