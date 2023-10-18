import type { FormDataType, FormFieldKind } from '@douglasneuroinformatics/form-types';
import { ValidationSchema } from '@douglasneuroinformatics/nestjs/core';
import type Types from '@open-data-capture/types';
import type { JSONSchemaType } from 'ajv';
import { type ZodType, type ZodTypeAny, z } from 'zod';

const LanguageSchema: ZodType<Types.Language> = z.enum(['en', 'fr']);

const UIOptionSchema = <T extends ZodTypeAny>(schema: T) =>
  z.union([
    schema,
    z.object({
      en: schema,
      fr: schema
    })
  ]);

const FieldKindSchema: ZodType<FormFieldKind> = z.enum(['options', 'date', 'array', 'binary', 'numeric', 'text']);

const BaseFieldSchema = z.object({
  description: UIOptionSchema(z.string()).optional(),
  isRequired: z.boolean().optional(),
  kind: FieldKindSchema,
  label: UIOptionSchema(z.string())
});

const TextFieldSchema: ZodType<Types.FormInstrumentTextField> = BaseFieldSchema.extend({
  kind: z.literal('text'),
  variant: z.enum(['long', 'password', 'short'])
});

const OptionsFieldSchema: ZodType<Types.FormInstrumentOptionsField> = BaseFieldSchema.extend({
  kind: z.literal('options'),
  options: UIOptionSchema(z.record(z.string()))
});

const DateFieldSchema: ZodType<Types.FormInstrumentDateField> = BaseFieldSchema.extend({
  kind: z.literal('date')
});

const NumericFieldSchema: ZodType<Types.FormInstrumentNumericField> = BaseFieldSchema.extend({
  kind: z.literal('numeric'),
  max: z.number(),
  min: z.number(),
  variant: z.enum(['default', 'slider'])
});

const BinaryFieldSchema: ZodType<Types.FormInstrumentBinaryField> = BaseFieldSchema.extend({
  kind: z.literal('binary'),
  options: UIOptionSchema(
    z.object({
      f: z.string(),
      t: z.string()
    })
  ).optional(),
  variant: z.enum(['checkbox', 'radio'])
});

const PrimitiveFieldSchema: ZodType<Types.FormInstrumentPrimitiveField> = z.union([
  TextFieldSchema,
  OptionsFieldSchema,
  DateFieldSchema,
  NumericFieldSchema,
  BinaryFieldSchema
]);

const ArrayFieldSchema: ZodType<Types.FormInstrumentArrayField> = BaseFieldSchema.extend({
  // Dynamic fieldset is not permitted here
  fieldset: z.record(PrimitiveFieldSchema),
  kind: z.literal('array')
});

const StaticFieldsSchema: ZodType<Types.FormInstrumentStaticFields> = z.record(
  z.union([PrimitiveFieldSchema, ArrayFieldSchema])
);

const FieldsGroupSchema: ZodType<Types.FormInstrumentFieldsGroup> = z.object({
  description: UIOptionSchema(z.string()).optional(),
  fields: StaticFieldsSchema,
  title: UIOptionSchema(z.string())
});

const ContentSchema: ZodType<Types.FormInstrumentContent> = z.union([StaticFieldsSchema, FieldsGroupSchema.array()]);

export const FormValidationSchema = z.object({
  content: ContentSchema,
  details: z.object({
    description: UIOptionSchema(z.string()),
    estimatedDuration: z.number(),
    instructions: UIOptionSchema(z.union([z.string(), z.string().array()])),
    title: UIOptionSchema(z.string())
  }),
  kind: z.literal('form'),
  language: z.union([LanguageSchema, z.array(LanguageSchema)]),
  name: z.string(),
  tags: UIOptionSchema(z.string().array()),
  validationSchema: z.object({
    properties: z.record(z.any()),
    required: z.string().array(),
    type: z.literal('object')
  }),
  version: z.number()
}) satisfies ZodType<Types.FormInstrument>;

@ValidationSchema(FormValidationSchema)
export class CreateFormDto implements Types.FormInstrument {
  content: Types.FormInstrumentContent;
  details: Types.FormInstrumentDetails;
  kind: 'form';
  language: Types.InstrumentLanguage;
  measures?: Types.FormInstrumentMeasures;
  name: string;
  tags: Record<Types.Language, string[]> | string[];
  validationSchema: JSONSchemaType<FormDataType>;
  version: number;
}
