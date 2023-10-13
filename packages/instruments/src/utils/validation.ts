import type { FormFieldKind } from '@douglasneuroinformatics/form-types';
import type Types from '@open-data-capture/types';
import { type ZodType, type ZodTypeAny, z } from 'zod';

const languageSchema: ZodType<Types.Language> = z.enum(['en', 'fr']);

const instrumentUIOption = <T extends ZodTypeAny>(schema: T) => {
  return z.union([
    schema,
    z.object({
      en: schema,
      fr: schema
    })
  ]);
};

export const instrumentKindSchema: ZodType<Types.InstrumentKind> = z.enum(['form']);

export const InstrumentLanguageSchema: ZodType<Types.InstrumentLanguage> = z.union([
  languageSchema,
  z.array(languageSchema)
]);

export const formInstrumentDetailsSchema: ZodType<Types.FormInstrumentDetails> = z.object({
  description: instrumentUIOption(z.string()),
  estimatedDuration: z.number(),
  instructions: instrumentUIOption(z.union([z.string(), z.string().array()])),
  title: instrumentUIOption(z.string())
});

export const formFieldKindSchema: ZodType<FormFieldKind> = z.enum([
  'options',
  'date',
  'array',
  'binary',
  'numeric',
  'text'
]);

export const formInstrumentBaseFieldSchema = z.object({
  description: instrumentUIOption(z.string()),
  isRequired: z.boolean().optional(),
  kind: formFieldKindSchema,
  label: instrumentUIOption(z.string())
});

export const formInstrumentTextFieldSchema: ZodType<Types.FormInstrumentTextField> =
  formInstrumentBaseFieldSchema.extend({
    kind: z.literal('text'),
    variant: z.enum(['long', 'password', 'short'])
  });

export const formInstrumentOptionsFieldSchema: ZodType<Types.FormInstrumentOptionsField> =
  formInstrumentBaseFieldSchema.extend({
    kind: z.literal('options'),
    options: instrumentUIOption(z.record(z.string()))
  });

export const formInstrumentDateFieldSchema: ZodType<Types.FormInstrumentDateField> =
  formInstrumentBaseFieldSchema.extend({
    kind: z.literal('date')
  });

export const formInstrumentNumericFieldSchema: ZodType<Types.FormInstrumentNumericField> =
  formInstrumentBaseFieldSchema.extend({
    kind: z.literal('numeric'),
    max: z.number(),
    min: z.number(),
    variant: z.enum(['default', 'slider'])
  });

export const formInstrumentBinaryFieldSchema: ZodType<Types.FormInstrumentBinaryField> =
  formInstrumentBaseFieldSchema.extend({
    kind: z.literal('binary'),
    options: z
      .object({
        f: z.string(),
        t: z.string()
      })
      .optional(),
    variant: z.enum(['checkbox', 'radio'])
  });

export const formInstrumentPrimitiveFieldSchema: ZodType<Types.FormInstrumentPrimitiveField> = z.union([
  formInstrumentTextFieldSchema,
  formInstrumentOptionsFieldSchema,
  formInstrumentDateFieldSchema,
  formInstrumentNumericFieldSchema,
  formInstrumentBinaryFieldSchema
]);

export const formInstrumentArrayFieldSchema: ZodType<Types.FormInstrumentArrayField> =
  formInstrumentBaseFieldSchema.extend({
    // Dynamic fieldset is not permitted here as this is used for static validation on backend
    fieldset: z.record(formInstrumentPrimitiveFieldSchema),
    kind: z.literal('array')
  });

export const formInstrumentStaticFieldsSchema: ZodType<Types.FormInstrumentStaticFields> = z.record(
  z.union([formInstrumentPrimitiveFieldSchema, formInstrumentArrayFieldSchema])
);

export const formInstrumentFieldsGroupSchema: ZodType<Types.FormInstrumentFieldsGroup> = z.object({
  description: instrumentUIOption(z.string()),
  fields: formInstrumentStaticFieldsSchema,
  title: instrumentUIOption(z.string())
});

export const formInstrumentContentSchema: ZodType<Types.FormInstrumentContent> = z.union([
  formInstrumentStaticFieldsSchema,
  formInstrumentFieldsGroupSchema.array()
]);
