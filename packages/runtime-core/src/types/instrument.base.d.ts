import type { LicenseIdentifier } from '@opendatacapture/licenses';
import type { ConditionalKeys, Merge, Simplify } from 'type-fest';
import type { z } from 'zod';

import type { Language } from './core.d.ts';

/**
 * The kind of an instrument. This serves as the discriminator key.
 * @public
 */
type InstrumentKind = 'FORM' | 'INTERACTIVE' | 'SERIES' | 'UNKNOWN';

/**
 * The language(s) of the instrument. For a unilingual instrument,
 * this is a literal string. Otherwise, it is an array of all
 * languages the instrument may be completed in.
 * @public
 */
type InstrumentLanguage = Language | Language[];

/**
 * Utility type used to for UI fields in an instrument. If `L` is an array,
 * then resolves to `Record<K, V>`, otherwise resolves to `V` (i.e., in the
 * case of a unilingual instrument).
 * @public
 *
 * @typeParam TLanguage - the language(s) of the instrument
 * @typeParam TValue - the value to be displayed in the UI
 */
type InstrumentUIOption<TLanguage extends InstrumentLanguage, TValue> = TLanguage extends Language
  ? TValue
  : TLanguage extends (infer L extends Language)[]
    ? { [K in L]: TValue }
    : never;

/**
 * An object containing the base details of any instrument to be displayed to the user. This may be
 * augmented in specific kinds of instruments, if applicable.
 * @public
 *
 * @typeParam TLanguage - the language(s) of the instrument
 */
type InstrumentDetails<TLanguage extends InstrumentLanguage = InstrumentLanguage> = {
  /** The legal person(s) that created the instrument and hold copyright to the instrument */
  authors?: null | string[];

  /** A brief description of the instrument, such as the purpose and history of the instrument */
  description: InstrumentUIOption<TLanguage, string>;

  /** An integer representing the estimated number of minutes for the average target subject to complete the instrument */
  estimatedDuration?: number;

  /** Brief sequential instructions for how the subject should complete the instrument. */
  instructions?: InstrumentUIOption<TLanguage, string[]>;

  /** An identifier corresponding to the SPDX license list version d2709ad (released on 2024-01-30) */
  license: LicenseIdentifier;

  /** An reference link where the user can learn more about the instrument */
  referenceUrl?: null | string;

  /** A URL where the user can find the source code for the instrument */
  sourceUrl?: null | string;

  /** The title of the instrument in the language it is written, omitting the definite article */
  title: InstrumentUIOption<TLanguage, string>;
};

/** @internal */
type UnilingualInstrumentDetails = InstrumentDetails<Language>;

/** @internal */
type MultilingualInstrumentDetails = InstrumentDetails<Language[]>;

/** @public */
type InstrumentMeasureValue = boolean | Date | number | string | undefined;

/** @public */
type InstrumentMeasure<TData = any, TLanguage extends InstrumentLanguage = InstrumentLanguage> =
  | {
      hidden?: boolean;
      kind: 'computed';
      label: InstrumentUIOption<TLanguage, string>;
      value: (data: TData) => InstrumentMeasureValue;
    }
  | {
      hidden?: boolean;
      kind: 'const';
      label?: InstrumentUIOption<TLanguage, string>;
      ref: TData extends { [key: string]: any }
        ? ConditionalKeys<TData, InstrumentMeasureValue> extends infer K
          ? [K] extends [never]
            ? string
            : K
          : never
        : never;
    };

/** @public */
type InstrumentMeasures<TData = any, TLanguage extends InstrumentLanguage = InstrumentLanguage> = {
  [key: string]: InstrumentMeasure<TData, TLanguage>;
};

/** @internal */
type UnilingualInstrumentMeasures<TData = any> = InstrumentMeasures<TData, Language>;

/** @internal */
type MultilingualInstrumentMeasures<TData = any> = InstrumentMeasures<TData, Language[]>;

/** @public */
type BaseInstrument<TLanguage extends InstrumentLanguage = InstrumentLanguage> = {
  /** The content in the instrument to be rendered to the user */
  content?: unknown;
  /** The details of the instrument to be displayed to the user */
  details: InstrumentDetails<TLanguage>;
  /** The database ID for the instrument. For scalar instruments, this is derived by the internal property. */
  id?: string;
  /** The discriminator key for the type of instrument */
  kind: InstrumentKind;
  /** The language(s) in which the instrument is written */
  language: TLanguage;
  /** A list of tags that users can use to filter instruments */
  tags: InstrumentUIOption<TLanguage, string[]>;
};

/** @public */
type ScalarInstrumentInternal = {
  /** The internal version of the instrument (a positive integer) */
  edition: number;
  /** The name of the instrument, which must be unique for a given edition */
  name: string;
};

/**
 * The basic properties common to all scalar instruments. Specific types of instruments (e.g., form, interactive)
 * extend this type and are discriminated according to the `kind` property.
 * @public
 *
 * @typeParam TData - the structure of the data derived from this instrument
 * @typeParam TLanguage - the language(s) of the instrument
 */
type ScalarInstrument<TData = any, TLanguage extends InstrumentLanguage = InstrumentLanguage> = Merge<
  BaseInstrument<TLanguage>,
  {
    internal: ScalarInstrumentInternal;

    /** Arbitrary measures derived from the data */
    measures: InstrumentMeasures<TData, TLanguage> | null;

    /** The zod validation schema for the instrument data */
    validationSchema: z.ZodType<TData>;
  }
>;

/**
 * An object containing the essential data describing an instrument, but omitting the content
 * and validation schema required to actually complete the instrument. This may be used for,
 * among other things, displaying available instruments to the user.
 * @internal
 */
type InstrumentSummary<T extends BaseInstrument = BaseInstrument> = {
  id: string;
} & Omit<T, 'content'>;

/** @internal */
type UnilingualInstrumentSummary = Simplify<InstrumentSummary<BaseInstrument<Language>>>;

/** @internal */
type MultilingualInstrumentSummary = Simplify<InstrumentSummary<BaseInstrument<Language[]>>>;

export {
  BaseInstrument,
  InstrumentDetails,
  InstrumentKind,
  InstrumentLanguage,
  InstrumentMeasure,
  InstrumentMeasures,
  InstrumentMeasureValue,
  InstrumentSummary,
  InstrumentUIOption,
  MultilingualInstrumentDetails,
  MultilingualInstrumentMeasures,
  MultilingualInstrumentSummary,
  ScalarInstrument,
  ScalarInstrumentInternal,
  UnilingualInstrumentDetails,
  UnilingualInstrumentMeasures,
  UnilingualInstrumentSummary
};
