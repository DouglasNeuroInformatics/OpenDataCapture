import { z } from 'zod';

/** BASE HELPER SCHEMAS */

const instrumentLanguageOptions = ['en', 'fr'] as const;

const instrumentKindOptions = ['form'] as const;

const instrumentDetailsSchema = z.object({
  description: z.string(),
  language: z.enum(instrumentLanguageOptions),
  instructions: z.string(),
  estimatedDuration: z.number(),
  version: z.number()
});

/** BASE INSTRUMENT SCHEMA */

const baseInstrumentSchema = z.object({
  title: z.string(),
  kind: z.enum(instrumentKindOptions),
  details: instrumentDetailsSchema
});

/** FORM INSTRUMENT SCHEMAS */

const formInstrumentFieldVariantOptions = ['text'] as const;

const formInstrumentFieldSchema = z.object({
  name: z.string(),
  label: z.string(),
  description: z.string(),
  variant: z.enum(formInstrumentFieldVariantOptions),
  isRequired: z.coerce.boolean()
});

const formInstrumentSchema = baseInstrumentSchema.extend({
  data: z.array(formInstrumentFieldSchema)
});

const instrumentSchema = z.discriminatedUnion('kind', [formInstrumentSchema]);

/** INSTRUMENT RECORD */

const instrumentRecordSchema = z.object({
  dateCollected: z.coerce.date(),
  clinic: z.undefined(),
  instrumentName: z.string(),
  subjectDemographics: z.object({
    firstName: z.string(),
    lastName: z.string(),
    dateOfBirth: z.coerce.date()
  }),
  data: z.any()
});

/** EXPORTS AND TYPE DEFS */

export {
  baseInstrumentSchema,
  instrumentLanguageOptions,
  instrumentKindOptions,
  formInstrumentFieldVariantOptions,
  formInstrumentFieldSchema,
  formInstrumentSchema,
  instrumentSchema,
  instrumentRecordSchema
};

export type InstrumentLanguage = (typeof instrumentLanguageOptions)[number];

export type InstrumentKind = (typeof instrumentKindOptions)[number];

export type FormInstrumentFieldVariant = (typeof formInstrumentFieldVariantOptions)[number];

export type BaseInstrumentInterface = z.infer<typeof baseInstrumentSchema>;

export type InstrumentDetailsInterface = z.infer<typeof instrumentDetailsSchema>;

export type FormInstrumentFieldInterface = z.infer<typeof formInstrumentFieldSchema>;

export type FormInstrumentInterface = z.infer<typeof formInstrumentSchema>;

export type InstrumentInterface = z.infer<typeof instrumentSchema>;

export type InstrumentRecordInterface = z.infer<typeof instrumentRecordSchema>;

/*




// Clinic 

export type InstrumentRecord = z.infer<typeof instrumentRecordSchema>;
*/
