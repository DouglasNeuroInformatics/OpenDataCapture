import type { FormInstrument, FormTypes, InstrumentLanguage } from '@opendatacapture/runtime-core';
import { z } from 'zod/v4';

import {
  $$InstrumentUIOption,
  $$ScalarInstrument,
  $AnyDynamicFunction,
  $InstrumentValidationSchema
} from './instrument.base.js';

const $StaticFieldKind: z.ZodType<FormTypes.StaticFieldKind> = z.enum([
  'string',
  'number',
  'boolean',
  'number-record',
  'record-array',
  'date',
  'set'
]);

const $$FormInstrumentBaseField = <TLanguage extends InstrumentLanguage>(language?: TLanguage) => {
  return z.object({
    description: $$InstrumentUIOption(z.string().min(1), language).optional(),
    disabled: z.boolean().optional(),
    kind: $StaticFieldKind,
    label: $$InstrumentUIOption(z.string().min(1), language)
  }) satisfies z.ZodType<FormInstrument.FieldMixin<TLanguage, FormTypes.BaseField>>;
};

const $$FormInstrumentStringField = <TLanguage extends InstrumentLanguage>(language?: TLanguage) => {
  return z.discriminatedUnion('variant', [
    $$FormInstrumentBaseField(language).extend({
      kind: z.literal('string'),
      options: $$InstrumentUIOption(z.record(z.string(), z.string().min(1)), language),
      variant: z.enum(['radio', 'select'])
    }),
    $$FormInstrumentBaseField(language).extend({
      kind: z.literal('string'),
      variant: z.enum(['input', 'password', 'textarea'])
    })
  ]) satisfies z.ZodType<FormInstrument.StringField<TLanguage>>;
};

const $FormInstrumentStringField = $$FormInstrumentStringField() satisfies z.ZodType<FormInstrument.StringField>;

const $$FormInstrumentNumberField = <TLanguage extends InstrumentLanguage>(language?: TLanguage) => {
  return z.discriminatedUnion('variant', [
    $$FormInstrumentBaseField(language).extend({
      kind: z.literal('number'),
      max: z.number().int(),
      min: z.number().int(),
      variant: z.literal('slider')
    }),
    $$FormInstrumentBaseField(language).extend({
      kind: z.literal('number'),
      max: z.number().optional(),
      min: z.number().optional(),
      variant: z.literal('input')
    }),
    $$FormInstrumentBaseField(language).extend({
      kind: z.literal('number'),
      options: $$InstrumentUIOption(z.record(z.string(), z.string().min(1)), language),
      variant: z.enum(['radio', 'select'])
    })
  ]) satisfies z.ZodType<FormInstrument.NumberField<TLanguage>>;
};

const $FormInstrumentNumberField = $$FormInstrumentNumberField() satisfies z.ZodType<FormInstrument.NumberField>;

const $$FormInstrumentDateField = <TLanguage extends InstrumentLanguage>(language?: TLanguage) => {
  return $$FormInstrumentBaseField(language).extend({
    kind: z.literal('date')
  }) satisfies z.ZodType<FormInstrument.DateField<TLanguage>>;
};

const $FormInstrumentDateField = $$FormInstrumentDateField() satisfies z.ZodType<FormInstrument.DateField>;

const $$FormInstrumentBooleanField = <TLanguage extends InstrumentLanguage>(language?: TLanguage) => {
  return z.discriminatedUnion('variant', [
    $$FormInstrumentBaseField(language).extend({
      kind: z.literal('boolean'),
      variant: z.literal('checkbox')
    }),
    $$FormInstrumentBaseField(language).extend({
      kind: z.literal('boolean'),
      options: $$InstrumentUIOption(
        z.object({
          false: z.string().min(1),
          true: z.string().min(1)
        }),
        language
      ).optional(),
      variant: z.literal('radio')
    })
  ]) satisfies z.ZodType<FormInstrument.BooleanField<TLanguage>>;
};

const $FormInstrumentBooleanField = $$FormInstrumentBooleanField() satisfies z.ZodType<FormInstrument.BooleanField>;

const $$FormInstrumentSetField = <TLanguage extends InstrumentLanguage>(language?: TLanguage) => {
  return $$FormInstrumentBaseField(language).extend({
    kind: z.literal('set'),
    options: $$InstrumentUIOption(z.record(z.string(), z.string().min(1)), language),
    variant: z.enum(['listbox', 'select'])
  }) satisfies z.ZodType<FormInstrument.SetField<TLanguage>>;
};

const $FormInstrumentSetField = $$FormInstrumentSetField() satisfies z.ZodType<FormInstrument.SetField>;

const $$FormInstrumentScalarField = <TLanguage extends InstrumentLanguage>(language?: TLanguage) => {
  return z.discriminatedUnion('kind', [
    $$FormInstrumentDateField(language),
    $$FormInstrumentSetField(language),
    $$FormInstrumentStringField(language),
    $$FormInstrumentNumberField(language),
    $$FormInstrumentBooleanField(language)
  ]) satisfies z.ZodType<FormInstrument.ScalarField<TLanguage>>;
};

const $FormInstrumentDynamicFieldsetField = z.object({
  kind: z.literal('dynamic'),
  render: $AnyDynamicFunction
}) satisfies z.ZodType<FormInstrument.DynamicFieldsetField>;

const $$FormInstrumentFieldset = <TLanguage extends InstrumentLanguage>(language?: TLanguage) => {
  return z.record(
    z.string(),
    z.discriminatedUnion('kind', [$FormInstrumentDynamicFieldsetField, $$FormInstrumentScalarField(language)])
  ) satisfies z.ZodType<FormInstrument.Fieldset<TLanguage>>;
};

const $$FormInstrumentRecordArrayField = <TLanguage extends InstrumentLanguage>(language?: TLanguage) => {
  return $$FormInstrumentBaseField(language).extend({
    fieldset: $$FormInstrumentFieldset(language),
    kind: z.literal('record-array')
  }) satisfies z.ZodType<FormInstrument.RecordArrayField<TLanguage>>;
};

const $$FormInstrumentNumberRecordField = <TLanguage extends InstrumentLanguage>(language?: TLanguage) => {
  return $$FormInstrumentBaseField(language).extend({
    items: z.record(
      z.string(),
      z.object({
        description: $$InstrumentUIOption(z.string(), language).optional(),
        label: $$InstrumentUIOption(z.string(), language)
      })
    ),
    kind: z.literal('number-record'),
    options: $$InstrumentUIOption(z.record(z.coerce.number<PropertyKey>(), z.string()), language),
    variant: z.literal('likert')
  }) satisfies z.ZodType<FormInstrument.NumberRecordField<TLanguage>>;
};

const $FormInstrumentNumberRecordField =
  $$FormInstrumentNumberRecordField() satisfies z.ZodType<FormInstrument.NumberRecordField>;

const $$FormInstrumentCompositeField = <TLanguage extends InstrumentLanguage>(language?: TLanguage) => {
  return z.union([
    $$FormInstrumentRecordArrayField(language),
    $$FormInstrumentNumberRecordField(language)
  ]) satisfies z.ZodType<FormInstrument.CompositeField<TLanguage>>;
};

const $FormInstrumentCompositeField =
  $$FormInstrumentCompositeField() satisfies z.ZodType<FormInstrument.CompositeField>;

const $$FormInstrumentStaticField = <TLanguage extends InstrumentLanguage>(language?: TLanguage) => {
  return z.union([$$FormInstrumentCompositeField(language), $$FormInstrumentScalarField(language)]) satisfies z.ZodType<
    FormInstrument.StaticField<TLanguage>
  >;
};

const $FormInstrumentDynamicField = z.object({
  deps: z.array(z.string()),
  kind: z.literal('dynamic'),
  render: $AnyDynamicFunction
}) satisfies z.ZodType<FormInstrument.DynamicField>;

const $$FormInstrumentUnknownField = <TLanguage extends InstrumentLanguage>(language?: TLanguage) => {
  return z.union([$FormInstrumentDynamicField, $$FormInstrumentStaticField(language)]) satisfies z.ZodType<
    FormInstrument.UnknownField<FormInstrument.Data, keyof FormInstrument.Data, TLanguage>
  >;
};

const $FormInstrumentUnknownField = $$FormInstrumentUnknownField() satisfies z.ZodType<FormInstrument.UnknownField>;

const $$FormInstrumentFields = <TLanguage extends InstrumentLanguage>(language?: TLanguage) => {
  return z.record(z.string(), $$FormInstrumentUnknownField(language)) satisfies z.ZodType<
    FormInstrument.Fields<FormInstrument.Data, TLanguage>
  >;
};

const $FormInstrumentFields = $$FormInstrumentFields() satisfies z.ZodType<FormInstrument.Fields>;

const $$FormInstrumentFieldsGroup = <TLanguage extends InstrumentLanguage>(language?: TLanguage) => {
  return z.object({
    description: $$InstrumentUIOption(z.string().min(1), language).optional(),
    fields: $$FormInstrumentFields(language),
    title: $$InstrumentUIOption(z.string().min(1), language).optional()
  }) satisfies z.ZodType<FormInstrument.FieldsGroup<FormInstrument.Data, TLanguage>>;
};

const $FormInstrumentFieldsGroup = $$FormInstrumentFieldsGroup() satisfies z.ZodType<FormInstrument.FieldsGroup>;

const $$FormInstrumentContent = <TLanguage extends InstrumentLanguage>(language?: TLanguage) => {
  return z.union([
    $$FormInstrumentFields(language),
    $$FormInstrumentFieldsGroup(language).array()
  ]) satisfies z.ZodType<FormInstrument.Content>;
};

const $FormInstrumentContent = $$FormInstrumentContent() satisfies z.ZodType<FormInstrument.Content>;

const $$FormInstrument = <TLanguage extends InstrumentLanguage>(language?: TLanguage) => {
  return $$ScalarInstrument(language).extend({
    content: $$FormInstrumentContent(language),
    initialValues: z.record(z.string(), z.any()).optional(),
    kind: z.literal('FORM'),
    validationSchema: $InstrumentValidationSchema
  }) satisfies z.ZodType<FormInstrument<FormInstrument.Data, TLanguage>>;
};

const $FormInstrument = $$FormInstrument() satisfies z.ZodType<FormInstrument>;

export {
  $$FormInstrument,
  $FormInstrument,
  $FormInstrumentBooleanField,
  $FormInstrumentCompositeField,
  $FormInstrumentContent,
  $FormInstrumentDateField,
  $FormInstrumentDynamicField,
  $FormInstrumentFields,
  $FormInstrumentFieldsGroup,
  $FormInstrumentNumberField,
  $FormInstrumentNumberRecordField,
  $FormInstrumentSetField,
  $FormInstrumentStringField,
  $FormInstrumentUnknownField
};
