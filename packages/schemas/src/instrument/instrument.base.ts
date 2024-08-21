import { isUnique } from '@douglasneuroinformatics/libjs';
import type {
  BaseInstrument,
  InstrumentDetails,
  InstrumentKind,
  InstrumentLanguage,
  InstrumentMeasures,
  InstrumentMeasureValue,
  InstrumentSummary,
  InstrumentUIOption,
  ScalarInstrument,
  UnilingualInstrumentDetails,
  UnilingualInstrumentMeasures
} from '@opendatacapture/runtime-core';
import type { ValueOf } from 'type-fest';
import { z } from 'zod';

import { $Language, $LicenseIdentifier, $ZodTypeAny, type Language } from '../core/core.js';

const $InstrumentKind: z.ZodType<InstrumentKind> = z.enum(['FORM', 'INTERACTIVE', 'SERIES', 'UNKNOWN']);

const $InstrumentLanguage = z.union([
  $Language,
  z
    .array($Language)
    .nonempty()
    .refine((arr) => isUnique(arr), {
      message: 'Array must contain unique values'
    })
]) satisfies z.ZodType<InstrumentLanguage>;

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

const $InstrumentDetails = z.object({
  authors: z.array(z.string()).nullish(),
  description: $$InstrumentUIOption(z.string().min(1)),
  estimatedDuration: z.number().int().nonnegative().optional(),
  instructions: $$InstrumentUIOption(z.array(z.string().min(1))).optional(),
  license: $LicenseIdentifier,
  referenceUrl: z.string().url().nullish(),
  sourceUrl: z.string().url().nullish(),
  title: $$InstrumentUIOption(z.string().min(1))
}) satisfies z.ZodType<InstrumentDetails>;

const $UnilingualInstrumentDetails = $InstrumentDetails.extend({
  description: z.string().min(1),
  instructions: z.array(z.string().min(1)).optional(),
  title: z.string().min(1)
}) satisfies z.ZodType<UnilingualInstrumentDetails>;

const $InstrumentMeasureValue: z.ZodType<InstrumentMeasureValue> = z.union([
  z.string(),
  z.boolean(),
  z.number(),
  z.date(),
  z.undefined()
]);

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

const $InstrumentMeasures = z.record(
  z.union([$ComputedInstrumentMeasure, $ConstantInstrumentMeasure])
) satisfies z.ZodType<InstrumentMeasures>;

const $UnilingualInstrumentMeasures = z.record(
  z.union([$UnilingualComputedInstrumentMeasure, $UnilingualConstantInstrumentMeasure])
) satisfies z.ZodType<UnilingualInstrumentMeasures>;

const $BaseInstrument = z.object({
  __runtimeVersion: z.literal(1),
  content: z.any(),
  details: $InstrumentDetails,
  id: z.string().optional(),
  kind: $InstrumentKind,
  language: $InstrumentLanguage,
  tags: $$InstrumentUIOption(z.array(z.string().min(1)))
}) satisfies z.ZodType<BaseInstrument>;

const $ScalarInstrumentInternal = z.object({
  edition: z.number().int().positive(),
  name: z.string().min(1)
});

const $ScalarInstrument = $BaseInstrument.extend({
  internal: $ScalarInstrumentInternal,
  measures: $InstrumentMeasures.nullable(),
  validationSchema: $ZodTypeAny
}) satisfies z.ZodType<ScalarInstrument>;

const $UnilingualScalarInstrument = $ScalarInstrument.extend({
  details: $UnilingualInstrumentDetails,
  language: $Language,
  measures: $UnilingualInstrumentMeasures.nullable(),
  tags: z.array(z.string().min(1))
}) satisfies z.ZodType<ScalarInstrument<any, Language>>;

const $InstrumentSummary = $BaseInstrument
  .omit({
    content: true
  })
  .extend({ id: z.string() }) satisfies z.ZodType<InstrumentSummary>;

type CreateInstrumentData = z.infer<typeof $CreateInstrumentData>;
const $CreateInstrumentData = z.object({
  bundle: z.string().min(1)
});

type InstrumentBundleContainer = z.infer<typeof $InstrumentBundleContainer>;
const $InstrumentBundleContainer = z.object({
  bundle: z.string(),
  id: z.string()
});

export {
  $$InstrumentUIOption,
  $BaseInstrument,
  $CreateInstrumentData,
  $InstrumentBundleContainer,
  $InstrumentDetails,
  $InstrumentKind,
  $InstrumentLanguage,
  $InstrumentMeasureValue,
  $InstrumentSummary,
  $ScalarInstrument,
  $ScalarInstrumentInternal,
  $UnilingualInstrumentDetails,
  $UnilingualScalarInstrument
};

export type { CreateInstrumentData, InstrumentBundleContainer };

export type { InstrumentSummary };
export type { MultilingualInstrumentSummary, UnilingualInstrumentSummary } from '@opendatacapture/runtime-core';
