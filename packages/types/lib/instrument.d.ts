import type Base from '@douglasneuroinformatics/form-types';
import type { JSONSchemaType } from 'ajv';
import type { Simplify } from 'type-fest';

import { Language } from './core';

export type InstrumentKind = 'form';

type InstrumentLanguage = Language | Language[];

type InstrumentUIOption<L extends InstrumentLanguage, V> = L extends Language
  ? V
  : L extends (infer K extends Language)[]
  ? Record<K, V>
  : never;

/** Defines the basic properties of all instruments */
export type BaseInstrument<TLanguage extends InstrumentLanguage = InstrumentLanguage> = {
  /** The content in the instrument to be rendered to the user */
  content: unknown;

  /** The discriminator key for the type of instrument */
  kind: InstrumentKind;

  /** The language(s) in which the instrument is written */
  language: TLanguage;

  /** The name of the instrument, which must be unique for a given version */
  name: string;

  /** A list of tags that users can use to filter instruments */
  tags: InstrumentUIOption<TLanguage, string[]>;

  /** The version of the instrument */
  version: number;
};

/** The details of the form to be displayed to the user */
export type FormInstrumentDetails<TLanguage extends InstrumentLanguage = InstrumentLanguage> = {
  /** A brief description of the instrument, such as the purpose and history of the instrument */
  description: InstrumentUIOption<TLanguage, string>;

  /** An integer representing the estimated number of minutes for the average target subject to complete the instrument */
  estimatedDuration: number;

  /** Brief instructions for how the subject should complete the instrument. If any array of string is provided, these are considered to be sequential. */
  instructions: InstrumentUIOption<TLanguage, string | string[]>;

  /** The title of the instrument in the language it is written, omitting the definite article */
  title: InstrumentUIOption<TLanguage, string>;
};

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

type FormInstrumentDateField<TLanguage extends InstrumentLanguage = InstrumentLanguage> = FormInstrumentFieldMixin<
  TLanguage,
  Base.DateFormField
>;

type FormInstrumentNumericField<TLanguage extends InstrumentLanguage = InstrumentLanguage> = FormInstrumentFieldMixin<
  TLanguage,
  Base.NumericFormField
>;

type FormInstrumentBinaryField<
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

type FormInstrumentPrimitiveField<
  TLanguage extends InstrumentLanguage = InstrumentLanguage,
  TValue extends Base.PrimitiveFieldValue = Base.PrimitiveFieldValue
> = TValue extends string
  ?
      | FormInstrumentDateField<TLanguage>
      | FormInstrumentOptionsField<TLanguage, TValue>
      | FormInstrumentTextField<TLanguage>
  : TValue extends number
  ? FormInstrumentNumericField<TLanguage>
  : TValue extends boolean
  ? FormInstrumentBinaryField<TLanguage>
  : never;

export type FormInstrumentArrayFieldset<
  TLanguage extends InstrumentLanguage = InstrumentLanguage,
  TFieldset extends Base.ArrayFieldValue[number] = Base.ArrayFieldValue[number]
> = {
  [K in keyof TFieldset]:
    | ((fieldset: { [K in keyof TFieldset]?: TFieldset[K] | null | undefined }) => FormInstrumentPrimitiveField<
        TLanguage,
        TFieldset[K]
      > | null)
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
  TLanguage extends InstrumentLanguage,
  TValue extends Base.ArrayFieldValue | Base.PrimitiveFieldValue
> = [TValue] extends [Base.PrimitiveFieldValue]
  ? FormInstrumentPrimitiveField<TLanguage, TValue>
  : [TValue] extends [Base.ArrayFieldValue]
  ? FormInstrumentArrayField<TLanguage, TValue>
  : FormInstrumentArrayField<TLanguage> | FormInstrumentPrimitiveField<TLanguage>;

export type FormInstrumentStaticFields<
  TLanguage extends InstrumentLanguage = InstrumentLanguage,
  TData extends Base.FormDataType = Base.FormDataType
> = {
  [K in keyof TData]: FormInstrumentStaticField<TLanguage, TData[K]>;
};

export type FormInstrumentDynamicField<
  TLanguage extends InstrumentLanguage,
  TData extends Base.FormDataType,
  TValue extends Base.ArrayFieldValue | Base.PrimitiveFieldValue
> = (data: Base.NullableFormDataType<TData> | null) => FormInstrumentStaticField<TLanguage, TValue> | null;

export type FormInstrumentUnknownField<
  TLanguage extends InstrumentLanguage,
  TData extends Base.FormDataType,
  TKey extends keyof TData = keyof TData
> = FormInstrumentDynamicField<TLanguage, TData, TData[TKey]> | FormInstrumentStaticField<TLanguage, TData[TKey]>;

export type FormInstrumentFields<
  TLanguage extends InstrumentLanguage = InstrumentLanguage,
  TData extends Base.FormDataType = Base.FormDataType
> = {
  [K in keyof TData]: FormInstrumentUnknownField<TLanguage, TData, K>;
};

export type FormInstrumentFieldsGroup<
  TLanguage extends InstrumentLanguage = InstrumentLanguage,
  TData extends Base.FormDataType = Base.FormDataType
> = {
  description?: InstrumentUIOption<TLanguage, string>;
  fields: {
    [K in keyof TData]?: FormInstrumentUnknownField<TLanguage, TData, K>;
  };
  title: InstrumentUIOption<TLanguage, string>;
};

export type FormInstrumentContent<
  TLanguage extends InstrumentLanguage = InstrumentLanguage,
  TData extends Base.FormDataType = Base.FormDataType
> = FormInstrumentFields<TLanguage, TData> | FormInstrumentFieldsGroup<TLanguage, TData>[];

export type FormInstrumentMeasures<
  TLanguage extends InstrumentLanguage = InstrumentLanguage,
  TData extends Base.FormDataType = Base.FormDataType
> = Record<
  string,
  {
    label: InstrumentUIOption<TLanguage, string>;
    value: (data: TData) => number;
  }
>;

export type FormInstrument<
  TData extends Base.FormDataType = Base.FormDataType,
  TLanguage extends InstrumentLanguage = InstrumentLanguage
> = Simplify<
  BaseInstrument<TLanguage> & {
    content: FormInstrumentContent<TLanguage, TData>;
    details: FormInstrumentDetails<TLanguage>;
    measures?: FormInstrumentMeasures<TLanguage, TData>;
    validationSchema: JSONSchemaType<TData>;
  }
>;

export type MultilingualFormInstrument<TData extends Base.FormDataType> = FormInstrument<TData, ['en', 'fr']>;

export type Instrument = FormInstrument;
