import type {
  ArrayFieldValue,
  FormDataType,
  FormFieldKind,
  PrimitiveFieldValue
} from '@douglasneuroinformatics/form-types';
import { z } from 'zod';

import { baseInstrumentSchema, instrumentSummarySchema } from '../instrument.schemas';
import { baseInstrumentDetailsSchema, translatedSchema } from './base-instrument.schemas';

import type * as Types from '../instrument.types';

const fieldKindSchema: Zod.ZodType<FormFieldKind> = z.enum(['options', 'date', 'array', 'binary', 'numeric', 'text']);

const baseFieldSchema = z.object({
  description: translatedSchema(z.string().min(1)).optional(),
  isRequired: z.boolean().optional(),
  kind: fieldKindSchema,
  label: translatedSchema(z.string().min(1))
});

const textFieldSchema = baseFieldSchema.extend({
  kind: z.literal('text'),
  variant: z.enum(['long', 'password', 'short'])
}) satisfies Zod.ZodType<Types.FormInstrumentTextField>;

const optionsFieldSchema = baseFieldSchema.extend({
  kind: z.literal('options'),
  options: translatedSchema(z.record(z.string().min(1)))
}) satisfies Zod.ZodType<Types.FormInstrumentOptionsField>;

const dateFieldSchema = baseFieldSchema.extend({
  kind: z.literal('date')
}) satisfies Zod.ZodType<Types.FormInstrumentDateField>;

const numericFieldSchema = baseFieldSchema.extend({
  kind: z.literal('numeric'),
  max: z.number(),
  min: z.number(),
  variant: z.enum(['default', 'slider'])
}) satisfies Zod.ZodType<Types.FormInstrumentNumericField>;

const binaryFieldSchema = baseFieldSchema.extend({
  kind: z.literal('binary'),
  options: translatedSchema(
    z.object({
      f: z.string().min(1),
      t: z.string().min(1)
    })
  ).optional(),
  variant: z.enum(['checkbox', 'radio'])
}) satisfies Zod.ZodType<Types.FormInstrumentBinaryField>;

const primitiveFieldSchema = z.union([
  textFieldSchema,
  optionsFieldSchema,
  dateFieldSchema,
  numericFieldSchema,
  binaryFieldSchema
]) satisfies Zod.ZodType<Types.FormInstrumentPrimitiveField>;

// This schema excludes dynamic fieldset
const arrayFieldSchema = baseFieldSchema.extend({
  fieldset: z.record(primitiveFieldSchema),
  kind: z.literal('array')
}) satisfies Zod.ZodType<Types.FormInstrumentArrayField>;

const staticFieldsSchema = z.record(
  z.union([primitiveFieldSchema, arrayFieldSchema])
) satisfies Zod.ZodType<Types.FormInstrumentStaticFields>;

const fieldsGroupSchema = z.object({
  description: translatedSchema(z.string().min(1)).optional(),
  fields: staticFieldsSchema,
  title: translatedSchema(z.string().min(1))
}) satisfies Zod.ZodType<Types.FormInstrumentFieldsGroup>;

const contentSchema = z.union([
  staticFieldsSchema,
  fieldsGroupSchema.array()
]) satisfies Zod.ZodType<Types.FormInstrumentContent>;

const formInstrumentDetailsSchema = baseInstrumentDetailsSchema.extend({
  estimatedDuration: z.number().positive(),
  instructions: translatedSchema(z.union([z.string().min(1), z.array(z.string().min(1))]))
}) satisfies Zod.ZodType<Types.BaseInstrumentDetails>;

export const formInstrumentSchema = baseInstrumentSchema.extend({
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

export const formInstrumentSummarySchema = instrumentSummarySchema.extend({
  measures: z
    .record(
      z.object({
        label: translatedSchema(z.string())
      })
    )
    .optional()
});

