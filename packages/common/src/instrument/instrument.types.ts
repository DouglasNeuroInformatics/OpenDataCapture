import type * as Base from '@douglasneuroinformatics/form-types';
import type { Simplify } from 'type-fest';
import type { z } from 'zod';

import type { Language } from '../core/core.types';

export type InstrumentKind = 'form';

export type InstrumentLanguage = Language | Language[];

export type InstrumentUIOption<L extends InstrumentLanguage, V> = L extends Language
  ? V
  : L extends (infer K extends Language)[]
  ? Record<K, V>
  : never;

/** The details of the instrument to be displayed to the user */
export type BaseInstrumentDetails<TLanguage extends InstrumentLanguage = InstrumentLanguage> = {
  /** A brief description of the instrument, such as the purpose and history of the instrument */
  description: InstrumentUIOption<TLanguage, string>;

  /** The title of the instrument in the language it is written, omitting the definite article */
  title: InstrumentUIOption<TLanguage, string>;
};

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

export type InstrumentSummary<TData = unknown, TLanguage extends InstrumentLanguage = InstrumentLanguage> = Omit<
  BaseInstrument<TData, TLanguage>,
  'content' | 'validationSchema'
>;

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
  FormInstrumentFieldMixin<TLanguage, Base.NumericFormField>;

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

export type FormInstrumentPrimitiveField<
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

export type FormInstrumentStaticFields<
  TData extends Base.FormDataType = Base.FormDataType,
  TLanguage extends InstrumentLanguage = InstrumentLanguage
> = {
  [K in keyof TData]: FormInstrumentStaticField<TLanguage, TData[K]>;
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
  [K in keyof TData]: FormInstrumentUnknownField<TData, K, TLanguage>;
};

export type FormInstrumentFieldsGroup<
  TData extends Base.FormDataType = Base.FormDataType,
  TLanguage extends InstrumentLanguage = InstrumentLanguage
> = {
  description?: InstrumentUIOption<TLanguage, string>;
  fields: {
    [K in keyof TData]?: FormInstrumentUnknownField<TData, K, TLanguage>;
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
  measures?: FormInstrumentMeasures<TData, TLanguage>;
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
