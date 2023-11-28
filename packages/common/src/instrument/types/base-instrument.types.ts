import type { Language } from '../../core/core.types';

/** Discriminator property for instrument objects */
export type InstrumentKind = 'form';

/**
 * The language(s) of the instrument. For a unilingual instrument,
 * this is a literal string. Otherwise, it is an array of all
 * languages the instrument may be completed in.
 */
export type InstrumentLanguage = Language | Language[];

/**
 * Utility type used to for UI fields in an instrument. If `L` is an array,
 * then resolves to `Record<K, V>`, otherwise resolves to `V` (i.e., in the
 * case of a unilingual instrument).
 *
 * @typeParam TLanguage - the language(s) of the instrument
 * @typeParam TValue - the value to be displayed in the UI
 */
export type InstrumentUIOption<TLanguage extends InstrumentLanguage, TValue> = TLanguage extends Language
  ? TValue
  : TLanguage extends (infer K extends Language)[]
    ? Record<K, TValue>
    : never;

/**
 * An object containing the base details of any instrument to be displayed to the user. This may be
 * augmented in specific kinds of instruments, if applicable.
 *
 * @typeParam TLanguage - the language(s) of the instrument
 */
export type BaseInstrumentDetails<TLanguage extends InstrumentLanguage = InstrumentLanguage> = {
  /** A brief description of the instrument, such as the purpose and history of the instrument */
  description: InstrumentUIOption<TLanguage, string>;

  /** The title of the instrument in the language it is written, omitting the definite article */
  title: InstrumentUIOption<TLanguage, string>;
};

export type EnhancedBaseInstrumentDetails<TLanguage extends InstrumentLanguage = InstrumentLanguage> =
  BaseInstrumentDetails<TLanguage> & {
    /** An integer representing the estimated number of minutes for the average target subject to complete the instrument */
    estimatedDuration: number;
    /** Brief instructions for how the subject should complete the instrument. If any array of string is provided, these are considered to be sequential. */
    instructions: InstrumentUIOption<TLanguage, string | string[]>;
  };

/**
 * The basic properties common to all instruments. Specific types of instruments (e.g., form, interactive)
 * extend this type and are discriminated according to the `kind` property.
 *
 * @typeParam TData - the structure of the data derived from this instrument
 * @typeParam TLanguage - the language(s) of the instrument
 */
export type BaseInstrument<TData = unknown, TLanguage extends InstrumentLanguage = InstrumentLanguage> = {
  /** The content in the instrument to be rendered to the user */
  content?: unknown;

  /** The details of the instrument to be displayed to the user */
  details: BaseInstrumentDetails<TLanguage>;

  /** The MongoDB ObjectId represented as a hex string */
  id?: string;

  /** The discriminator key for the type of instrument */
  kind: InstrumentKind;

  /** The language(s) in which the instrument is written */
  language: TLanguage;

  /** Arbitrary measures derived from the data */
  measures?: unknown;

  /** The name of the instrument, which must be unique for a given version */
  name: string;

  /** A list of tags that users can use to filter instruments */
  tags: InstrumentUIOption<TLanguage, string[]>;

  /** The zod validation schema for the instrument data */
  validationSchema: Zod.ZodType<TData>;

  /** The version of the instrument */
  version: number;
};

/**
 * An object containing the essential data describing an instrument, but omitting the content
 * and validation schema required to actually complete the instrument. This may be used for,
 * among other things, displaying available instruments to the user.
 *
 * @typeParam TData - the structure of the data derived from this instrument
 * @typeParam TLanguage - the language(s) of the instrument
 */
export type InstrumentSummary<TData = unknown, TLanguage extends InstrumentLanguage = InstrumentLanguage> = Omit<
  BaseInstrument<TData, TLanguage>,
  'content' | 'validationSchema'
>;
