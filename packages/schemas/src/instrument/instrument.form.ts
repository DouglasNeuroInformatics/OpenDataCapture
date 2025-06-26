import { $AnyFunction } from '@douglasneuroinformatics/libjs';
import type { FormInstrument, FormTypes, InstrumentLanguage } from '@opendatacapture/runtime-core';
import { z } from 'zod/v4';

import { $$InstrumentUIOption, $InstrumentValidationSchema, $ScalarInstrument } from './instrument.base.js';

const $StaticFieldKind: z.ZodType<FormTypes.StaticFieldKind> = z.enum([
  'string',
  'number',
  'boolean',
  'number-record',
  'record-array',
  'date',
  'set'
]);

const $FormInstrumentBaseField = z.object({
  description: $$InstrumentUIOption(z.string().min(1)).optional(),
  disabled: z.boolean().optional(),
  kind: $StaticFieldKind,
  label: $$InstrumentUIOption(z.string().min(1))
}) satisfies z.ZodType<FormInstrument.FieldMixin<InstrumentLanguage, FormTypes.BaseField>>;

const $FormInstrumentStringField = z.discriminatedUnion('variant', [
  $FormInstrumentBaseField.extend({
    kind: z.literal('string'),
    options: $$InstrumentUIOption(z.record(z.string(), z.string().min(1))),
    variant: z.enum(['radio', 'select'])
  }),
  $FormInstrumentBaseField.extend({
    kind: z.literal('string'),
    variant: z.enum(['input', 'password', 'textarea'])
  })
]) satisfies z.ZodType<FormInstrument.StringField>;

const $FormInstrumentNumberField = z.discriminatedUnion('variant', [
  $FormInstrumentBaseField.extend({
    kind: z.literal('number'),
    max: z.number().int(),
    min: z.number().int(),
    variant: z.literal('slider')
  }),
  $FormInstrumentBaseField.extend({
    kind: z.literal('number'),
    max: z.number().optional(),
    min: z.number().optional(),
    variant: z.literal('input')
  }),
  $FormInstrumentBaseField.extend({
    kind: z.literal('number'),
    options: $$InstrumentUIOption(z.record(z.string(), z.string().min(1))),
    variant: z.enum(['radio', 'select'])
  })
]) satisfies z.ZodType<FormInstrument.NumberField>;

const $FormInstrumentDateField = $FormInstrumentBaseField.extend({
  kind: z.literal('date')
}) satisfies z.ZodType<FormInstrument.DateField>;

const $FormInstrumentBooleanField = z.discriminatedUnion('variant', [
  $FormInstrumentBaseField.extend({
    kind: z.literal('boolean'),
    variant: z.literal('checkbox')
  }),
  $FormInstrumentBaseField.extend({
    kind: z.literal('boolean'),
    options: $$InstrumentUIOption(
      z.object({
        false: z.string().min(1),
        true: z.string().min(1)
      })
    ).optional(),
    variant: z.literal('radio')
  })
]) satisfies z.ZodType<FormInstrument.BooleanField>;

const $FormInstrumentSetField = $FormInstrumentBaseField.extend({
  kind: z.literal('set'),
  options: $$InstrumentUIOption(z.record(z.string(), z.string().min(1))),
  variant: z.enum(['listbox', 'select'])
}) satisfies z.ZodType<FormInstrument.SetField>;

const $FormInstrumentScalarField = z.discriminatedUnion('kind', [
  $FormInstrumentDateField,
  $FormInstrumentSetField,
  $FormInstrumentStringField,
  $FormInstrumentNumberField,
  $FormInstrumentBooleanField
]) satisfies z.ZodType<FormInstrument.ScalarField>;

const $FormInstrumentDynamicFieldsetField = z.object({
  kind: z.literal('dynamic'),
  render: $AnyFunction
}) satisfies z.ZodType<FormInstrument.DynamicFieldsetField>;

const $FormInstrumentFieldset: z.ZodType<FormInstrument.Fieldset> = z.record(
  z.string(),
  z.discriminatedUnion('kind', [$FormInstrumentDynamicFieldsetField, $FormInstrumentScalarField])
);

const $FormInstrumentRecordArrayField: z.ZodType<FormInstrument.RecordArrayField> = $FormInstrumentBaseField.extend({
  fieldset: $FormInstrumentFieldset,
  kind: z.literal('record-array')
});

const $FormInstrumentNumberRecordField: z.ZodType<FormInstrument.NumberRecordField> = $FormInstrumentBaseField.extend({
  items: z.record(
    z.string(),
    z.object({
      description: $$InstrumentUIOption(z.string()).optional(),
      label: $$InstrumentUIOption(z.string())
    })
  ),
  kind: z.literal('number-record'),
  options: $$InstrumentUIOption(z.record(z.coerce.number<PropertyKey>(), z.string())),
  variant: z.literal('likert')
});

const $FormInstrumentCompositeField: z.ZodType<FormInstrument.CompositeField> = z.union([
  $FormInstrumentRecordArrayField,
  $FormInstrumentNumberRecordField
]);

const $FormInstrumentStaticField: z.ZodType<FormInstrument.StaticField> = z.union([
  $FormInstrumentCompositeField,
  $FormInstrumentScalarField
]);

const $FormInstrumentDynamicField: z.ZodType<FormInstrument.DynamicField> = z.object({
  deps: z.array(z.string()),
  kind: z.literal('dynamic'),
  render: $AnyFunction
});

const $FormInstrumentUnknownField: z.ZodType<FormInstrument.UnknownField> = z.union([
  $FormInstrumentDynamicField,
  $FormInstrumentStaticField
]);

const $FormInstrumentFields: z.ZodType<FormInstrument.Fields> = z.record(z.string(), $FormInstrumentUnknownField);

const $FormInstrumentFieldsGroup = z.object({
  description: $$InstrumentUIOption(z.string().min(1)).optional(),
  fields: $FormInstrumentFields,
  title: $$InstrumentUIOption(z.string().min(1)).optional()
}) satisfies z.ZodType<FormInstrument.FieldsGroup>;

const $FormInstrumentContent = z.union([
  $FormInstrumentFields,
  $FormInstrumentFieldsGroup.array()
]) satisfies z.ZodType<FormInstrument.Content>;

const $FormInstrument = $ScalarInstrument.extend({
  content: $FormInstrumentContent,
  initialValues: z.record(z.string(), z.any()).optional(),
  kind: z.literal('FORM'),
  validationSchema: $InstrumentValidationSchema
}) satisfies z.ZodType<FormInstrument>;

export {
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
