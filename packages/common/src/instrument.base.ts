import { z } from 'zod';
import { $BaseModel, $Language } from './core';

export const $InstrumentKind = z.enum(['form']);

export type InstrumentKind = z.infer<typeof $InstrumentKind>;

export const $TranslatedSchema = <T extends Zod.ZodTypeAny>($Schema: T) => z.record($Language, $Schema);

/**
 * An object containing the base details of any instrument to be displayed to the user. This may be
 * augmented in specific kinds of instruments, if applicable.
 */
export type BaseInstrumentDetails = z.infer<typeof $BaseInstrumentDetails>;

export const $BaseInstrumentDetails = z.object({
  /** A brief description of the instrument, such as the purpose and history of the instrument */
  description: $TranslatedSchema(z.string().min(1)),
  /** The title of the instrument in the language it is written, omitting the definite article */
  title: $TranslatedSchema(z.string().min(1))
});

/** An object with additional details relevant to multiple categories of instrument  */
export type EnhancedBaseInstrumentDetails = z.infer<typeof $EnhancedBaseInstrumentDetails>;

export const $EnhancedBaseInstrumentDetails = $BaseInstrumentDetails.extend({
  /** An integer representing the estimated number of minutes for the average target subject to complete the instrument */
  estimatedDuration: z.number().int().positive(),
  /** Brief instructions for how the subject should complete the instrument. These are considered to be sequential and will be rendered separated by newlines.  */
  instructions: $TranslatedSchema(z.array(z.string().min(1)))
});

/**
 * The basic properties common to all instruments. Specific types of instruments (e.g., form, interactive)
 * extend this type and are discriminated according to the `kind` property.
 */
export type BaseInstrument = z.infer<typeof $BaseInstrument>;

export const $BaseInstrument = $BaseModel.extend({
  /** The content in the instrument to be rendered to the user */
  content: z.unknown(),
  /** The details of the instrument to be displayed to the user */
  details: $BaseInstrumentDetails,
  /** The discriminator key for the type of instrument */
  kind: $InstrumentKind,
  /** The languages in which the instrument is written */
  languages: $Language.array().min(1),
  /** Arbitrary measures derived from the data */
  measures: z.unknown().optional(),
  /** The name of the instrument, which must be unique for a given version */
  name: z.string().min(1),
  /** A list of tags that users can use to filter instruments */
  tags: $TranslatedSchema(z.array(z.string().min(1))),
  /** The zod validation schema for the instrument data */
  validationSchema: z.instanceof(z.ZodType),
  /** The version of the instrument */
  version: z.number()
});

/**
 * An object containing the essential data describing an instrument, but omitting the content
 * and validation schema required to actually complete the instrument. This may be used for,
 * among other things, displaying available instruments to the user.
 */
export type BaseInstrumentSummary = z.infer<typeof $BaseInstrumentSummary>;

export const $BaseInstrumentSummary = $BaseInstrument.omit({
  content: true,
  validationSchema: true
});

export type CreateInstrumentData = z.infer<typeof $CreateInstrumentData>;

export const $CreateInstrumentData = z.object({
  source: z.string().min(1)
});

export type InstrumentSourceContainer = z.infer<typeof $InstrumentSourceContainer>;

export const $InstrumentSourceContainer = z.object({
  id: z.string(),
  name: z.string(),
  source: z.string(),
  version: z.number()
});

export type InstrumentBundleContainer = z.infer<typeof $InstrumentBundleContainer>;

export const $InstrumentBundleContainer = z.object({
  bundle: z.string()
});
