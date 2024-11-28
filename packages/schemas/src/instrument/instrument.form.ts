import type { FormInstrument, FormTypes, InstrumentLanguage } from '@opendatacapture/runtime-core';
import { z } from 'zod';

import { $ZodTypeAny, isZodObjectType } from '../core/core.js';
import { $$InstrumentUIOption, $ScalarInstrument } from './instrument.base.js';

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

const $FormInstrumentStringField: z.ZodType<FormInstrument.StringField> = z.union([
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

const $FormInstrumentNumberField: z.ZodType<FormInstrument.NumberField> = z.union([
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

const $FormInstrumentDateField: z.ZodType<FormInstrument.DateField> = $FormInstrumentBaseField.extend({
  kind: z.literal('date')
});

const $FormInstrumentBooleanField: z.ZodType<FormInstrument.BooleanField> = z.union([
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

const $FormInstrumentSetField: z.ZodType<FormInstrument.SetField> = $FormInstrumentBaseField.extend({
  kind: z.literal('set'),
  options: $$InstrumentUIOption(z.record(z.string().min(1))),
  variant: z.enum(['listbox', 'select'])
});

const $FormInstrumentScalarField: z.ZodType<FormInstrument.ScalarField> = z.union([
  $FormInstrumentDateField,
  $FormInstrumentSetField,
  $FormInstrumentStringField,
  $FormInstrumentNumberField,
  $FormInstrumentBooleanField
]);

const $FormInstrumentDynamicFieldsetField: z.ZodType<FormInstrument.DynamicFieldsetField> = z.object({
  kind: z.literal('dynamic'),
  render: z.function().args(z.any()).returns($FormInstrumentScalarField.nullable())
});

const $FormInstrumentFieldset: z.ZodType<FormInstrument.Fieldset> = z.record(
  z.union([$FormInstrumentDynamicFieldsetField, $FormInstrumentScalarField])
);

const $FormInstrumentRecordArrayField: z.ZodType<FormInstrument.RecordArrayField> = $FormInstrumentBaseField.extend({
  fieldset: $FormInstrumentFieldset,
  kind: z.literal('record-array')
});

const $FormInstrumentNumberRecordField: z.ZodType<FormInstrument.NumberRecordField> = $FormInstrumentBaseField.extend({
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
  render: z.function().args(z.any()).returns($FormInstrumentStaticField.nullable())
});

const $FormInstrumentUnknownField: z.ZodType<FormInstrument.UnknownField> = z.union([
  $FormInstrumentDynamicField,
  $FormInstrumentStaticField
]);

const $FormInstrumentFields: z.ZodType<FormInstrument.Fields> = z.record($FormInstrumentUnknownField);

const $FormInstrumentFieldsGroup = z.object({
  description: $$InstrumentUIOption(z.string().min(1)).optional(),
  fields: $FormInstrumentFields,
  title: $$InstrumentUIOption(z.string().min(1)).optional()
}) satisfies z.ZodType<FormInstrument.FieldsGroup>;

const $FormInstrumentContent = z.union([
  $FormInstrumentFields,
  $FormInstrumentFieldsGroup.array()
]) satisfies z.ZodType<FormInstrument.Content>;

const $FormInstrument: z.ZodType<FormInstrument> = $ScalarInstrument
  .extend({
    content: $FormInstrumentContent,
    initialValues: z.any(),
    kind: z.literal('FORM'),
    validationSchema: $ZodTypeAny
  })
  .superRefine((instrument, ctx) => {
    if (!instrument.initialValues) {
      return;
    } else if (!isZodObjectType(instrument.validationSchema)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        fatal: true,
        message: "Expected validationSchema._def._type to be 'ZodObject'",
        path: ['validationSchema']
      });
      return;
    }
    const result = instrument.validationSchema.deepPartial().safeParse(instrument.initialValues);
    if (result.success) {
      return;
    }
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Initial values must conform to validation schema',
      params: {
        issues: result.error.issues
      },
      path: ['initialValues']
    });
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
