import type {
  FormInstrument,
  FormInstrumentBooleanField,
  FormInstrumentCompositeField,
  FormInstrumentContent,
  FormInstrumentDateField,
  FormInstrumentDynamicField,
  FormInstrumentDynamicFieldsetField,
  FormInstrumentFieldMixin,
  FormInstrumentFields,
  FormInstrumentFieldset,
  FormInstrumentFieldsGroup,
  FormInstrumentNumberField,
  FormInstrumentNumberRecordField,
  FormInstrumentRecordArrayField,
  FormInstrumentScalarField,
  FormInstrumentSetField,
  FormInstrumentStaticField,
  FormInstrumentStringField,
  FormInstrumentUnknownField,
  FormTypes,
  InstrumentLanguage
} from '@opendatacapture/runtime-core';
import { z } from 'zod';

import { $ZodTypeAny } from '../core/core.js';
import { $$InstrumentUIOption, $InstrumentDetails, $ScalarInstrument } from './instrument.base.js';

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
  isRequired: z.boolean().optional(),
  kind: $StaticFieldKind,
  label: $$InstrumentUIOption(z.string().min(1))
}) satisfies z.ZodType<FormInstrumentFieldMixin<InstrumentLanguage, FormTypes.BaseFormField>>;

const $FormInstrumentStringField: z.ZodType<FormInstrumentStringField> = z.union([
  $FormInstrumentBaseField.extend({
    kind: z.literal('string'),
    options: $$InstrumentUIOption(z.record(z.string().min(1))),
    variant: z.enum(['radio', 'select'])
  }),
  $FormInstrumentBaseField.extend({
    kind: z.literal('string'),
    variant: z.enum(['input', 'password', 'textarea'])
  })
]);

const $FormInstrumentNumberField: z.ZodType<FormInstrumentNumberField> = z.union([
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
    options: $$InstrumentUIOption(z.record(z.string().min(1))),
    variant: z.enum(['radio', 'select'])
  })
]);

const $FormInstrumentDateField: z.ZodType<FormInstrumentDateField> = $FormInstrumentBaseField.extend({
  kind: z.literal('date')
});

const $FormInstrumentBooleanField: z.ZodType<FormInstrumentBooleanField> = z.union([
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
]);

const $FormInstrumentSetField: z.ZodType<FormInstrumentSetField> = $FormInstrumentBaseField.extend({
  kind: z.literal('set'),
  options: $$InstrumentUIOption(z.record(z.string().min(1))),
  variant: z.enum(['listbox', 'select'])
});

const $FormInstrumentScalarField: z.ZodType<FormInstrumentScalarField> = z.union([
  $FormInstrumentDateField,
  $FormInstrumentSetField,
  $FormInstrumentStringField,
  $FormInstrumentNumberField,
  $FormInstrumentBooleanField
]);

const $FormInstrumentDynamicFieldsetField: z.ZodType<FormInstrumentDynamicFieldsetField> = z.object({
  kind: z.literal('dynamic'),
  render: z.function().args(z.any()).returns($FormInstrumentScalarField.nullable())
});

const $FormInstrumentFieldset: z.ZodType<FormInstrumentFieldset> = z.record(
  z.union([$FormInstrumentDynamicFieldsetField, $FormInstrumentScalarField])
);

const $FormInstrumentRecordArrayField: z.ZodType<FormInstrumentRecordArrayField> = $FormInstrumentBaseField.extend({
  fieldset: $FormInstrumentFieldset,
  kind: z.literal('record-array')
});

const $FormInstrumentNumberRecordField: z.ZodType<FormInstrumentNumberRecordField> = $FormInstrumentBaseField.extend({
  items: z.record(
    z.object({
      description: $$InstrumentUIOption(z.string()).optional(),
      label: $$InstrumentUIOption(z.string())
    })
  ),
  kind: z.literal('number-record'),
  options: $$InstrumentUIOption(z.record(z.coerce.number(), z.string())),
  variant: z.literal('likert')
});

const $FormInstrumentCompositeField: z.ZodType<FormInstrumentCompositeField> = z.union([
  $FormInstrumentRecordArrayField,
  $FormInstrumentNumberRecordField
]);

const $FormInstrumentStaticField: z.ZodType<FormInstrumentStaticField> = z.union([
  $FormInstrumentCompositeField,
  $FormInstrumentScalarField
]);

const $FormInstrumentDynamicField: z.ZodType<FormInstrumentDynamicField> = z.object({
  deps: z.array(z.string()),
  kind: z.literal('dynamic'),
  render: z.function().args(z.any()).returns($FormInstrumentStaticField.nullable())
});

const $FormInstrumentUnknownField: z.ZodType<FormInstrumentUnknownField> = z.union([
  $FormInstrumentDynamicField,
  $FormInstrumentStaticField
]);

const $FormInstrumentFields: z.ZodType<FormInstrumentFields> = z.record($FormInstrumentUnknownField);

const $FormInstrumentFieldsGroup = z.object({
  description: $$InstrumentUIOption(z.string().min(1)).optional(),
  fields: $FormInstrumentFields,
  title: $$InstrumentUIOption(z.string().min(1)).optional()
}) satisfies z.ZodType<FormInstrumentFieldsGroup>;

const $FormInstrumentContent = z.union([
  $FormInstrumentFields,
  $FormInstrumentFieldsGroup.array()
]) satisfies z.ZodType<FormInstrumentContent>;

const $FormInstrument: z.ZodType<FormInstrument> = $ScalarInstrument.extend({
  content: $FormInstrumentContent,
  details: $InstrumentDetails.required({
    estimatedDuration: true
  }),
  kind: z.literal('FORM'),
  validationSchema: $ZodTypeAny
});

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
