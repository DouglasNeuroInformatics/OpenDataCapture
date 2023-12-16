import type {
  ArrayFieldValue,
  FormDataType,
  FormFieldKind,
  PrimitiveFieldValue
} from '@douglasneuroinformatics/form-types';
import { z } from 'zod';

import { $BaseInstrument, $BaseInstrumentDetails, $BaseInstrumentSummary, $TranslatedSchema } from './instrument.base';

const $FormFieldKind = z.enum([
  'options',
  'date',
  'array',
  'binary',
  'numeric',
  'text'
]) satisfies Zod.ZodType<FormFieldKind>;

const $BaseFieldSchema = z.object({
  description: $TranslatedSchema(z.string().min(1)).optional(),
  isRequired: z.boolean().optional(),
  kind: $FormFieldKind,
  label: $TranslatedSchema(z.string().min(1))
});

export const textFieldSchema = $BaseFieldSchema.extend({
  kind: z.literal('text'),
  variant: z.enum(['long', 'password', 'short'])
}) satisfies Zod.ZodType<Types.FormInstrumentTextField>;

export const optionsFieldSchema = $BaseFieldSchema.extend({
  kind: z.literal('options'),
  options: $TranslatedSchema(z.record(z.string().min(1)))
}) satisfies Zod.ZodType<Types.FormInstrumentOptionsField>;

export const dateFieldSchema = $BaseFieldSchema.extend({
  kind: z.literal('date')
}) satisfies Zod.ZodType<Types.FormInstrumentDateField>;

export const numericFieldSchema = $BaseFieldSchema.extend({
  kind: z.literal('numeric'),
  max: z.number(),
  min: z.number(),
  variant: z.enum(['default', 'slider'])
}) satisfies Zod.ZodType<Types.FormInstrumentNumericField>;

export const binaryFieldSchema = $BaseFieldSchema.extend({
  kind: z.literal('binary'),
  options: $TranslatedSchema(
    z.object({
      f: z.string().min(1),
      t: z.string().min(1)
    })
  ).optional(),
  variant: z.enum(['checkbox', 'radio'])
}) satisfies Zod.ZodType<Types.FormInstrumentBinaryField>;

export const primitiveFieldSchema = z.union([
  textFieldSchema,
  optionsFieldSchema,
  dateFieldSchema,
  numericFieldSchema,
  binaryFieldSchema
]) satisfies Zod.ZodType<Types.FormInstrumentPrimitiveField>;

// This schema excludes dynamic fieldset
export const arrayFieldSchema = $BaseFieldSchema.extend({
  fieldset: z.record(primitiveFieldSchema),
  kind: z.literal('array')
}) satisfies Zod.ZodType<Types.FormInstrumentArrayField>;

export const staticFieldsSchema = z.record(
  z.union([primitiveFieldSchema, arrayFieldSchema])
) satisfies Zod.ZodType<Types.FormInstrumentStaticFields>;

export const fieldsGroupSchema = z.object({
  description: $TranslatedSchema(z.string().min(1)).optional(),
  fields: staticFieldsSchema,
  title: $TranslatedSchema(z.string().min(1))
}) satisfies Zod.ZodType<Types.FormInstrumentFieldsGroup>;

export const contentSchema = z.union([
  staticFieldsSchema,
  fieldsGroupSchema.array()
]) satisfies Zod.ZodType<Types.FormInstrumentContent>;

export const formInstrumentDetailsSchema = $BaseInstrumentDetails.extend({
  estimatedDuration: z.number().positive(),
  instructions: $TranslatedSchema(z.union([z.string().min(1), z.array(z.string().min(1))]))
}) satisfies Zod.ZodType<Types.BaseInstrumentDetails>;

export const formInstrumentSchema = $BaseInstrument.extend({
  content: contentSchema,
  details: formInstrumentDetailsSchema,
  kind: z.literal('form'),
  validationSchema: z.instanceof(z.ZodType<FormDataType>)
}) satisfies Zod.ZodType<Types.FormInstrument>;

export const primitiveFieldValueSchema = z.union([
  z.string(),
  z.number(),
  z.boolean(),
  z.coerce.date()
]) satisfies Zod.ZodType<PrimitiveFieldValue>;

export const arrayFieldValueSchema = z.array(
  z.record(primitiveFieldValueSchema)
) satisfies Zod.ZodType<ArrayFieldValue>;

export const formDataTypeSchema = z.record(
  z.union([primitiveFieldValueSchema, arrayFieldValueSchema])
) satisfies Zod.ZodType<FormDataType>;

export const form$BaseInstrumentSummary = $BaseInstrumentSummary.extend({
  measures: z
    .record(
      z.object({
        label: $TranslatedSchema(z.string())
      })
    )
    .optional()
});
