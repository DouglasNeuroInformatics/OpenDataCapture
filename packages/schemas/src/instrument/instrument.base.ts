import { isUnique, isZodType } from '@douglasneuroinformatics/libjs';
import type {
  BaseInstrument,
  ClientInstrumentDetails,
  ComputedInstrumentMeasure,
  ConstantInstrumentMeasure,
  InstrumentDetails,
  InstrumentKind,
  InstrumentLanguage,
  InstrumentMeasures,
  InstrumentMeasureValue,
  InstrumentMeasureVisibility,
  InstrumentUIOption,
  InstrumentValidationSchema,
  ScalarInstrument,
  UnilingualClientInstrumentDetails,
  UnilingualInstrumentDetails,
  UnilingualInstrumentMeasures
} from '@opendatacapture/runtime-core';
import type { Simplify } from 'type-fest';
import { z } from 'zod/v4';

import { $Language, $LicenseIdentifier } from '../core/core.js';

import type { Language } from '../core/core.js';

const $AnyDynamicFunction: z.ZodType<(...args: any[]) => any> = z
  .any()
  .refine((arg) => typeof arg === 'function', 'must be function');

const $InstrumentKind = z.enum(['FORM', 'INTERACTIVE', 'SERIES']) satisfies z.ZodType<InstrumentKind>;

const $$InstrumentLanguage = <const TLanguage extends InstrumentLanguage>(language?: TLanguage) => {
  let resolvedSchema: z.ZodTypeAny = z.never();
  if (typeof language === 'string') {
    resolvedSchema = z.literal(language as Extract<TLanguage, string>) satisfies z.ZodType<TLanguage>;
  } else if (Array.isArray(language)) {
    resolvedSchema = z
      .array(z.enum(language))
      .nonempty()
      .refine((arr) => isUnique(arr), {
        message: 'Array must contain unique values'
      });
  } else if (typeof language === 'undefined') {
    resolvedSchema = z.union([
      $Language,
      z
        .array($Language)
        .nonempty()
        .refine((arr) => isUnique(arr), {
          message: 'Array must contain unique values'
        })
    ]) satisfies z.ZodType<InstrumentLanguage>;
  }
  return resolvedSchema as z.ZodType<TLanguage>;
};

const $InstrumentLanguage = $$InstrumentLanguage() satisfies z.ZodType<InstrumentLanguage>;

const $InstrumentValidationSchema: z.ZodType<InstrumentValidationSchema> = z.any().refine((arg) => {
  // we cannot use z.custom here as it is cannot be converted to JSON schema
  return isZodType(arg, { version: 3 }) || isZodType(arg, { version: 4 });
}, 'Must be ZodType');

const $$InstrumentUIOption = <TSchema extends z.ZodTypeAny, TLanguage extends InstrumentLanguage>(
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

const $$ClientInstrumentDetails = <TLanguage extends InstrumentLanguage>(language?: TLanguage) => {
  return z.object({
    estimatedDuration: z.number().int().nonnegative().optional(),
    instructions: $$InstrumentUIOption(z.array(z.string().min(1)), language).optional(),
    title: $$InstrumentUIOption(z.string().min(1), language).optional()
  }) satisfies z.ZodType<ClientInstrumentDetails<TLanguage>>;
};

const $ClientInstrumentDetails = $$ClientInstrumentDetails() satisfies z.ZodType<ClientInstrumentDetails>;

const $UnilingualClientInstrumentDetails = $ClientInstrumentDetails.extend({
  instructions: z.array(z.string().min(1)).optional(),
  title: z.string().min(1).optional()
}) satisfies z.ZodType<UnilingualClientInstrumentDetails>;

const $$InstrumentDetails = <TLanguage extends InstrumentLanguage>(language?: TLanguage) => {
  return $$ClientInstrumentDetails(language)
    .required({ title: true })
    .extend({
      authors: z.array(z.string()).nullish(),
      description: $$InstrumentUIOption(z.string().min(1), language),
      license: $LicenseIdentifier,
      referenceUrl: z.string().url().nullish(),
      sourceUrl: z.string().url().nullish()
    }) satisfies z.ZodType<InstrumentDetails<TLanguage>>;
};

const $InstrumentDetails = $$InstrumentDetails() satisfies z.ZodType<InstrumentDetails>;

const $UnilingualInstrumentDetails = $InstrumentDetails.extend({
  description: z.string().min(1),
  instructions: z.array(z.string().min(1)).optional(),
  title: z.string().min(1)
}) satisfies z.ZodType<UnilingualInstrumentDetails>;

const $InstrumentMeasureVisibility: z.ZodType<InstrumentMeasureVisibility> = z.enum(['hidden', 'visible']);

const $RecordArrayFieldValue = z.union([z.string(), z.boolean(), z.number(), z.date(), z.undefined()]);

const $RecordArrayPair = z.record(z.string(), $RecordArrayFieldValue);

const $InstrumentMeasureValue: z.ZodType<InstrumentMeasureValue> = z.union([
  z.string(),
  z.boolean(),
  z.number(),
  z.date(),
  z.array($RecordArrayPair),
  z.undefined()
]);

const $$ComputedInstrumentMeasure = <TLanguage extends InstrumentLanguage>(language?: TLanguage) => {
  return z.object({
    hidden: z.boolean().optional(),
    kind: z.literal('computed'),
    label: $$InstrumentUIOption(z.string(), language),
    value: $AnyDynamicFunction
  }) satisfies z.ZodType<ComputedInstrumentMeasure<any, TLanguage>>;
};

const $UnilingualComputedInstrumentMeasure = z.object({
  hidden: z.boolean().optional(),
  kind: z.literal('computed'),
  label: z.string(),
  value: $AnyDynamicFunction,
  visibility: $InstrumentMeasureVisibility.optional()
}) satisfies z.ZodType<ComputedInstrumentMeasure<any, Language>>;

const $$ConstantInstrumentMeasure = <TLanguage extends InstrumentLanguage>(language?: TLanguage) => {
  return z.object({
    hidden: z.boolean().optional(),
    kind: z.literal('const'),
    label: $$InstrumentUIOption(z.string(), language).optional(),
    ref: z.string(),
    visibility: $InstrumentMeasureVisibility.optional()
  }) satisfies z.ZodType<ConstantInstrumentMeasure<any, TLanguage>>;
};

const $UnilingualConstantInstrumentMeasure = z.object({
  hidden: z.boolean().optional(),
  kind: z.literal('const'),
  label: z.string().optional(),
  ref: z.string(),
  visibility: $InstrumentMeasureVisibility.optional()
}) satisfies z.ZodType<ConstantInstrumentMeasure<any, Language>>;

const $$InstrumentMeasures = <TLanguage extends InstrumentLanguage>(language?: TLanguage) => {
  return z.record(
    z.string(),
    z.discriminatedUnion('kind', [$$ComputedInstrumentMeasure(language), $$ConstantInstrumentMeasure(language)])
  ) satisfies z.ZodType<InstrumentMeasures<any, TLanguage>>;
};

const $UnilingualInstrumentMeasures = z.record(
  z.string(),
  z.discriminatedUnion('kind', [$UnilingualComputedInstrumentMeasure, $UnilingualConstantInstrumentMeasure])
) satisfies z.ZodType<UnilingualInstrumentMeasures>;

const $$BaseInstrument = <const TLanguage extends InstrumentLanguage>(language?: TLanguage) => {
  return z.object({
    __runtimeVersion: z.literal(1),
    clientDetails: $$ClientInstrumentDetails(language).optional(),
    content: z.any(),
    details: $$InstrumentDetails(language),
    id: z.string().optional(),
    kind: $InstrumentKind,
    language: $$InstrumentLanguage(language),
    tags: $$InstrumentUIOption(z.array(z.string().min(1)), language)
  }) satisfies z.ZodType<BaseInstrument<TLanguage>>;
};

const $BaseInstrument = $$BaseInstrument() satisfies z.ZodType<BaseInstrument>;

const $ScalarInstrumentInternal = z.object({
  edition: z.number().int().positive(),
  name: z.string().min(1)
});

const $$ScalarInstrument = <TLanguage extends InstrumentLanguage>(language?: TLanguage) => {
  return $$BaseInstrument(language).extend({
    defaultMeasureVisibility: $InstrumentMeasureVisibility.optional(),
    internal: $ScalarInstrumentInternal,
    measures: $$InstrumentMeasures(language).nullable(),
    validationSchema: $InstrumentValidationSchema
  }) satisfies z.ZodType<ScalarInstrument<any, TLanguage>>;
};

const $ScalarInstrument = $$ScalarInstrument() satisfies z.ZodType<ScalarInstrument>;

const $UnilingualScalarInstrument = $ScalarInstrument.extend({
  clientDetails: $UnilingualClientInstrumentDetails.optional(),
  details: $UnilingualInstrumentDetails,
  language: $Language,
  measures: $UnilingualInstrumentMeasures.nullable(),
  tags: z.array(z.string().min(1))
}) satisfies z.ZodType<ScalarInstrument<any, Language>>;

/**
 * An object containing the essential data describing an instrument, but omitting the content
 * and validation schema required to actually complete the instrument. This may be used for,
 * among other things, displaying available instruments to the user.
 */
type InstrumentInfo<T extends BaseInstrument = BaseInstrument> = Omit<T, 'content'> & {
  id: string;
  internal?: {
    edition: number;
  };
};

const $InstrumentInfo = $BaseInstrument
  .omit({
    content: true
  })
  .extend({ id: z.string(), internal: $ScalarInstrumentInternal.optional() }) satisfies z.ZodType<InstrumentInfo>;

/** @internal */
type UnilingualInstrumentInfo = Simplify<InstrumentInfo<BaseInstrument<Language>>>;

/** @internal */
type TranslatedInstrumentInfo = UnilingualInstrumentInfo & {
  supportedLanguages: Language[];
};

/** @internal */
type MultilingualInstrumentInfo = Simplify<InstrumentInfo<BaseInstrument<Language[]>>>;

type CreateInstrumentData = z.infer<typeof $CreateInstrumentData>;
const $CreateInstrumentData = z.object({
  bundle: z.string().min(1)
});

const $BaseInstrumentBundleContainer = z.object({
  id: z.string()
});

type ScalarInstrumentBundleContainer = z.infer<typeof $ScalarInstrumentBundleContainer>;
const $ScalarInstrumentBundleContainer = $BaseInstrumentBundleContainer.extend({
  bundle: z.string(),
  kind: z.enum(['FORM', 'INTERACTIVE'])
});

type SeriesInstrumentBundleContainer = z.infer<typeof $SeriesInstrumentBundleContainer>;
const $SeriesInstrumentBundleContainer = $BaseInstrumentBundleContainer.extend({
  bundle: z.string(),
  items: z.array($ScalarInstrumentBundleContainer),
  kind: z.literal('SERIES')
});

type InstrumentBundleContainer = ScalarInstrumentBundleContainer | SeriesInstrumentBundleContainer;
const $InstrumentBundleContainer: z.ZodType<InstrumentBundleContainer> = z.discriminatedUnion('kind', [
  $ScalarInstrumentBundleContainer,
  $SeriesInstrumentBundleContainer
]);

export {
  $$BaseInstrument,
  $$InstrumentDetails,
  $$InstrumentUIOption,
  $$ScalarInstrument,
  $AnyDynamicFunction,
  $BaseInstrument,
  $ClientInstrumentDetails,
  $CreateInstrumentData,
  $InstrumentBundleContainer,
  $InstrumentDetails,
  $InstrumentInfo,
  $InstrumentKind,
  $InstrumentLanguage,
  $InstrumentMeasureValue,
  $InstrumentValidationSchema,
  $RecordArrayFieldValue,
  $ScalarInstrument,
  $ScalarInstrumentBundleContainer,
  $ScalarInstrumentInternal,
  $UnilingualInstrumentDetails,
  $UnilingualScalarInstrument
};

export type {
  CreateInstrumentData,
  InstrumentBundleContainer,
  InstrumentInfo,
  MultilingualInstrumentInfo,
  ScalarInstrumentBundleContainer,
  SeriesInstrumentBundleContainer,
  TranslatedInstrumentInfo,
  UnilingualInstrumentInfo
};
