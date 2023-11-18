import type * as Base from '@douglasneuroinformatics/form-types';
import type { KeysOfUnion, Simplify } from 'type-fest';
import type { z } from 'zod';

import type { Language } from '../core/core.types';

/** Discriminator property for instrument objects */
type InstrumentKind = 'form';

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

/**
 * Utility type to implement one of the core field types defined in `@douglasneuroinformatics/form-types`.
 * This is necessary due to the possibility of multilingual form instruments. Essentially, this type just
 * wraps UI text with the `InstrumentUIOption` utility.
 *
 * @typeParam TLanguage - the language(s) of the instrument
 * @typeParam TBase - the base field type that this field corresponds to
 * @typeParam TField - optional extensions to the multilingual base type
 */
export type FormInstrumentFieldMixin<
  TLanguage extends InstrumentLanguage,
  TBase extends Base.BaseFormField,
  TField extends object = object
> = Simplify<
  Omit<TBase, 'description' | 'label' | keyof TField> & {
    description?: InstrumentUIOption<TLanguage, string>;
    label: InstrumentUIOption<TLanguage, string>;
  } & TField
>;

export type FormInstrumentTextField<TLanguage extends InstrumentLanguage = InstrumentLanguage> =
  FormInstrumentFieldMixin<TLanguage, Base.TextFormField>;

export type FormInstrumentOptionsField<
  TLanguage extends InstrumentLanguage = InstrumentLanguage,
  TValue extends string = string
> = FormInstrumentFieldMixin<
  TLanguage,
  Base.OptionsFormField<TValue>,
  {
    options: InstrumentUIOption<
      TLanguage,
      {
        [K in TValue]: string;
      }
    >;
  }
>;

export type FormInstrumentDateField<TLanguage extends InstrumentLanguage = InstrumentLanguage> =
  FormInstrumentFieldMixin<TLanguage, Base.DateFormField>;

export type FormInstrumentNumericField<TLanguage extends InstrumentLanguage = InstrumentLanguage> =
  | FormInstrumentFieldMixin<TLanguage, Extract<Base.NumericFormField, { variant: 'default' }>>
  | FormInstrumentFieldMixin<TLanguage, Extract<Base.NumericFormField, { variant: 'slider' }>>;

export type FormInstrumentBinaryField<
  TLanguage extends InstrumentLanguage = InstrumentLanguage,
  TField extends Base.BinaryFormField = Base.BinaryFormField
> = TField extends {
  variant: 'checkbox';
}
  ? FormInstrumentFieldMixin<TLanguage, TField>
  : FormInstrumentFieldMixin<
      TLanguage,
      TField,
      {
        options?: InstrumentUIOption<
          TLanguage,
          {
            f: string;
            t: string;
          }
        >;
      }
    >;

/**
 * Conditional type representing a static field corresponding for a `PrimitiveFieldValue`
 *
 * @typeParam TLanguage - the language(s) of the instrument
 * @typeParam TValue - the value corresponding to this field in `FormDataType`
 */
export type FormInstrumentPrimitiveField<
  TLanguage extends InstrumentLanguage = InstrumentLanguage,
  TValue extends Base.PrimitiveFieldValue = Base.PrimitiveFieldValue
> = TValue extends Date
  ? FormInstrumentDateField<TLanguage>
  : TValue extends string
    ? FormInstrumentOptionsField<TLanguage, TValue> | FormInstrumentTextField<TLanguage>
    : TValue extends number
      ? FormInstrumentNumericField<TLanguage>
      : TValue extends boolean
        ? FormInstrumentBinaryField<TLanguage>
        : never;

export type FormInstrumentDynamicFieldsetField<
  TLanguage extends InstrumentLanguage = InstrumentLanguage,
  TFieldset extends Base.ArrayFieldValue[number] = Base.ArrayFieldValue[number],
  TValue extends Base.PrimitiveFieldValue = Base.PrimitiveFieldValue
> = {
  kind: 'dynamic-fieldset';
  render: (fieldset: {
    [K in keyof TFieldset]?: TFieldset[K] | null | undefined;
  }) => FormInstrumentPrimitiveField<TLanguage, TValue> | null;
};

export type FormInstrumentArrayFieldset<
  TLanguage extends InstrumentLanguage = InstrumentLanguage,
  TFieldset extends Base.ArrayFieldValue[number] = Base.ArrayFieldValue[number]
> = {
  [K in keyof TFieldset]:
    | FormInstrumentDynamicFieldsetField<TLanguage, TFieldset, TFieldset[K]>
    | FormInstrumentPrimitiveField<TLanguage, TFieldset[K]>;
};

export type FormInstrumentArrayField<
  TLanguage extends InstrumentLanguage = InstrumentLanguage,
  TValue extends Base.ArrayFieldValue = Base.ArrayFieldValue
> = FormInstrumentFieldMixin<
  TLanguage,
  Base.ArrayFormField<TValue>,
  {
    fieldset: FormInstrumentArrayFieldset<TLanguage, TValue[number]>;
  }
>;

export type FormInstrumentStaticField<
  TLanguage extends InstrumentLanguage = InstrumentLanguage,
  TValue extends Base.ArrayFieldValue | Base.PrimitiveFieldValue = Base.ArrayFieldValue | Base.PrimitiveFieldValue
> = [TValue] extends [Base.PrimitiveFieldValue]
  ? FormInstrumentPrimitiveField<TLanguage, TValue>
  : [TValue] extends [Base.ArrayFieldValue]
    ? FormInstrumentArrayField<TLanguage, TValue>
    : FormInstrumentArrayField<TLanguage> | FormInstrumentPrimitiveField<TLanguage>;

export type FormInstrumentReservedKey = KeysOfUnion<FormInstrumentStaticField>;

export type FormInstrumentFieldKey<T extends PropertyKey> = T extends FormInstrumentReservedKey ? never : T;

export type FormInstrumentStaticFields<
  TData extends Base.FormDataType = Base.FormDataType,
  TLanguage extends InstrumentLanguage = InstrumentLanguage
> = {
  [K in keyof TData as FormInstrumentFieldKey<K>]: FormInstrumentStaticField<TLanguage, TData[K]>;
};

export type FormInstrumentDynamicField<
  TData extends Base.FormDataType = Base.FormDataType,
  TValue extends Base.ArrayFieldValue | Base.PrimitiveFieldValue = Base.ArrayFieldValue | Base.PrimitiveFieldValue,
  TLanguage extends InstrumentLanguage = InstrumentLanguage
> = {
  deps: readonly Extract<keyof TData, string>[];
  kind: 'dynamic';
  render: (data: Base.NullableFormDataType<TData> | null) => FormInstrumentStaticField<TLanguage, TValue> | null;
};

export type FormInstrumentUnknownField<
  TData extends Base.FormDataType = Base.FormDataType,
  TKey extends keyof TData = keyof TData,
  TLanguage extends InstrumentLanguage = InstrumentLanguage
> = FormInstrumentDynamicField<TData, TData[TKey], TLanguage> | FormInstrumentStaticField<TLanguage, TData[TKey]>;

export type FormInstrumentFields<
  TData extends Base.FormDataType = Base.FormDataType,
  TLanguage extends InstrumentLanguage = InstrumentLanguage
> = {
  [K in keyof TData as FormInstrumentFieldKey<K>]: FormInstrumentUnknownField<TData, K, TLanguage>;
};

export type FormInstrumentFieldsGroup<
  TData extends Base.FormDataType = Base.FormDataType,
  TLanguage extends InstrumentLanguage = InstrumentLanguage
> = {
  description?: InstrumentUIOption<TLanguage, string>;
  fields: {
    [K in keyof TData as FormInstrumentFieldKey<K>]?: FormInstrumentUnknownField<TData, K, TLanguage>;
  };
  title: InstrumentUIOption<TLanguage, string>;
};

export type FormInstrumentContent<
  TData extends Base.FormDataType = Base.FormDataType,
  TLanguage extends InstrumentLanguage = InstrumentLanguage
> = FormInstrumentFields<TData, TLanguage> | FormInstrumentFieldsGroup<TData, TLanguage>[];

export type FormInstrumentMeasures<
  TData extends Base.FormDataType = Base.FormDataType,
  TLanguage extends InstrumentLanguage = InstrumentLanguage
> = Record<
  string,
  {
    label: InstrumentUIOption<TLanguage, string>;
    value: (data: TData) => number;
  }
>;

export type FormInstrumentDetails<TLanguage extends InstrumentLanguage = InstrumentLanguage> =
  BaseInstrumentDetails<TLanguage> & {
    /** An integer representing the estimated number of minutes for the average target subject to complete the instrument */
    estimatedDuration: number;
    /** Brief instructions for how the subject should complete the instrument. If any array of string is provided, these are considered to be sequential. */
    instructions: InstrumentUIOption<TLanguage, string | string[]>;
  };

export type FormInstrument<
  TData extends Base.FormDataType = Base.FormDataType,
  TLanguage extends InstrumentLanguage = InstrumentLanguage
> = Simplify<
  Omit<BaseInstrument<TData, TLanguage>, 'details'> & {
    content: FormInstrumentContent<TData, TLanguage>;
    details: FormInstrumentDetails<TLanguage>;
    measures?: FormInstrumentMeasures<TData, TLanguage>;
  }
>;

export type FormInstrumentSummary<
  TData extends Base.FormDataType = Base.FormDataType,
  TLanguage extends InstrumentLanguage = InstrumentLanguage
> = InstrumentSummary<TData, TLanguage> & {
  measures?: Record<
    string,
    {
      label: InstrumentUIOption<TLanguage, string>;
    }
  >;
};

export type InstrumentBundle = {
  bundle: string;
};

export type InstrumentSource = {
  source: string;
};

export type BilingualFormInstrument<TData extends Base.FormDataType> = FormInstrument<TData, Language[]>;

export type Instrument = FormInstrument;

export type InstrumentContext = {
  z: typeof z;
};

export type InstrumentFactory<T extends BaseInstrument = BaseInstrument> = (ctx: InstrumentContext) => T;

export type { InstrumentKind };
