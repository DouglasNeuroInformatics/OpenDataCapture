import type { FormDataType, FormFieldKind } from '@douglasneuroinformatics/form-types';
import type Types from '@open-data-capture/types';
import type { FormInstrumentSummary } from '@open-data-capture/types';
import { ZodType, z } from 'zod';

import { languageSchema } from './core.schema';

const uiOptionSchema = <T extends ZodType>(schema: T) =>
  z.union([
    schema,
    z.object({
      en: schema,
      fr: schema
    })
  ]);

const fieldKindSchema: ZodType<FormFieldKind> = z.enum(['options', 'date', 'array', 'binary', 'numeric', 'text']);

const baseFieldSchema = z.object({
  description: uiOptionSchema(z.string().min(1)).optional(),
  isRequired: z.boolean().optional(),
  kind: fieldKindSchema,
  label: uiOptionSchema(z.string().min(1))
});

const textFieldSchema = baseFieldSchema.extend({
  kind: z.literal('text'),
  variant: z.enum(['long', 'password', 'short'])
}) satisfies ZodType<Types.FormInstrumentTextField>;

const optionsFieldSchema = baseFieldSchema.extend({
  kind: z.literal('options'),
  options: uiOptionSchema(z.record(z.string().min(1)))
}) satisfies ZodType<Types.FormInstrumentOptionsField>;

const dateFieldSchema = baseFieldSchema.extend({
  kind: z.literal('date')
}) satisfies ZodType<Types.FormInstrumentDateField>;

const numericFieldSchema = baseFieldSchema.extend({
  kind: z.literal('numeric'),
  max: z.number(),
  min: z.number(),
  variant: z.enum(['default', 'slider'])
}) satisfies ZodType<Types.FormInstrumentNumericField>;

const binaryFieldSchema = baseFieldSchema.extend({
  kind: z.literal('binary'),
  options: uiOptionSchema(
    z.object({
      f: z.string().min(1),
      t: z.string().min(1)
    })
  ).optional(),
  variant: z.enum(['checkbox', 'radio'])
}) satisfies ZodType<Types.FormInstrumentBinaryField>;

const primitiveFieldSchema = z.union([
  textFieldSchema,
  optionsFieldSchema,
  dateFieldSchema,
  numericFieldSchema,
  binaryFieldSchema
]) satisfies ZodType<Types.FormInstrumentPrimitiveField>;

// This schema excludes dynamic fieldset
const arrayFieldSchema = baseFieldSchema.extend({
  fieldset: z.record(primitiveFieldSchema),
  kind: z.literal('array')
}) satisfies ZodType<Types.FormInstrumentArrayField>;

const staticFieldsSchema = z.record(
  z.union([primitiveFieldSchema, arrayFieldSchema])
) satisfies ZodType<Types.FormInstrumentStaticFields>;

const fieldsGroupSchema = z.object({
  description: uiOptionSchema(z.string().min(1)).optional(),
  fields: staticFieldsSchema,
  title: uiOptionSchema(z.string().min(1))
}) satisfies ZodType<Types.FormInstrumentFieldsGroup>;

const contentSchema = z.union([
  staticFieldsSchema,
  fieldsGroupSchema.array()
]) satisfies ZodType<Types.FormInstrumentContent>;

export const formInstrumentSchema = z.object({
  content: contentSchema,
  details: z.object({
    description: uiOptionSchema(z.string().min(1)),
    estimatedDuration: z.number(),
    instructions: uiOptionSchema(z.union([z.string().min(1), z.array(z.string().min(1))])),
    title: uiOptionSchema(z.string().min(1))
  }),
  kind: z.literal('form'),
  language: z.union([languageSchema, z.array(languageSchema)]),
  name: z.string().min(1),
  tags: uiOptionSchema(z.array(z.string().min(1))),
  validationSchema: z.instanceof(ZodType<FormDataType>),
  version: z.number()
}) satisfies ZodType<Types.FormInstrument>;

export const formInstrumentSummarySchema = formInstrumentSchema.omit({
  content: true,
  measures: true,
  validationSchema: true
}) satisfies ZodType<FormInstrumentSummary>;
