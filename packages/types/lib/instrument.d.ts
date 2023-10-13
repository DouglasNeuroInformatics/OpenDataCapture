import type Base from '@douglasneuroinformatics/form-types';
import type { JSONSchemaType } from 'ajv';
import type { ConditionalKeys, Simplify } from 'type-fest';

import { Language } from './core';

export type InstrumentKind = 'form';

/** Defines the basic properties of all instruments */
export type BaseInstrument = {
  /** The content in the instrument to be rendered to the user */
  content: unknown;

  /** The discriminator key for the type of instrument */
  kind: InstrumentKind;

  /** The English name of the instrument which is used to associate alternative versions of the same instrument */
  name: string;

  /** A list of tags that users can use to filter instruments */
  tags: string[];

  /** The version of the instrument */
  version: number;
};

/** The details of the form to be displayed to the user */
export type FormDetails = {
  /** A brief description of the instrument, such as the purpose and history of the instrument */
  description: string;

  /** An integer representing the estimated number of minutes for the average target subject to complete the instrument */
  estimatedDuration: number;

  /** Brief instructions for how the subject should complete the instrument. If any array of string is provided, these are considered to be sequential. */
  instructions: string | string[];

  /** The language in which the fields of the instrument are written */
  language: Language;

  /** The title of the instrument in the language it is written, omitting the definite article */
  title: string;
};

export type Measure<TData extends Base.FormInstrumentData = Base.FormInstrumentData> = {
  formula:
    | {
        field: ConditionalKeys<TData, number>;
        kind: 'const';
      }
    | {
        fields: ConditionalKeys<TData, boolean | number>[];
        kind: 'sum';
        options?: {
          coerceBool?: boolean;
        };
      };
  label: string;
};

export type Measures<TData extends Base.FormInstrumentData = Base.FormInstrumentData> = Record<string, Measure<TData>>;

export type FormInstrument<TData extends Base.FormInstrumentData = Base.FormInstrumentData> = Simplify<
  BaseInstrument & {
    content: Base.FormInstrumentContent<TData>;
    details: FormDetails;
    measures?: Measures<TData>;
    validationSchema: JSONSchemaType<TData>;
  }
>;

export type FormInstrumentSummary = Simplify<
  Omit<FormInstrument, 'content' | 'validationSchema'> & {
    identifier: string;
  }
>;

/**
 * The details of the form to be displayed to the user. This corresponds to the same
 * properties as `FormDetails`, excluding language, but with multilingual options
 */
type MultilingualFormDetails = Simplify<
  Pick<FormDetails, 'estimatedDuration'> & {
    [K in keyof Pick<FormDetails, 'description' | 'instructions' | 'title'>]: {
      [L in Language]: FormDetails[K];
    };
  }
>;

type MultilingualFormFieldMixin<T, U extends object = object> = T extends Base.BaseFormField
  ? Simplify<
      Omit<T, 'description' | 'label' | keyof U> & {
        description?: { [L in Language]: string };
        label: { [L in Language]: string };
      } & U
    >
  : never;

type MultilingualTextFormField = MultilingualFormFieldMixin<Base.TextFormField>;

type MultilingualOptionsFormField<TValue extends string = string> = MultilingualFormFieldMixin<
  Base.OptionsFormField<TValue>,
  {
    options: {
      [L in Language]: {
        [K in TValue]: string;
      };
    };
  }
>;

type MultilingualDateFormField = MultilingualFormFieldMixin<Base.DateFormField>;

type MultilingualNumericFormField = MultilingualFormFieldMixin<Base.NumericFormField>;

type MultilingualBinaryFormField<T extends Base.BinaryFormField = Base.BinaryFormField> = T extends {
  variant: 'radio';
}
  ? MultilingualFormFieldMixin<
      T,
      {
        options?: {
          [L in Language]: {
            f: string;
            t: string;
          };
        };
      }
    >
  : MultilingualFormFieldMixin<T>;

type MultilingualPrimitiveFormField<TValue extends Base.PrimitiveFieldValue = Base.PrimitiveFieldValue> =
  TValue extends string
    ? MultilingualDateFormField | MultilingualOptionsFormField<TValue> | MultilingualTextFormField
    : TValue extends number
    ? MultilingualNumericFormField
    : TValue extends boolean
    ? MultilingualBinaryFormField
    : never;

type MultilingualArrayFieldset<T extends Base.ArrayFieldValue[number]> = {
  [K in keyof T]:
    | ((fieldset: { [K in keyof T]?: T[K] | null | undefined }) => MultilingualPrimitiveFormField<T[K]> | null)
    | MultilingualPrimitiveFormField<T[K]>;
};

type MultilingualArrayFormField<TValue extends Base.ArrayFieldValue = Base.ArrayFieldValue> =
  MultilingualFormFieldMixin<
    Base.ArrayFormField,
    {
      fieldset: MultilingualArrayFieldset<TValue[number]>;
    }
  >;

export type MultilingualFormField<TValue> = [TValue] extends [Base.PrimitiveFieldValue]
  ? MultilingualPrimitiveFormField<TValue>
  : [TValue] extends [Base.ArrayFieldValue]
  ? MultilingualArrayFormField<TValue>
  : MultilingualArrayFormField | MultilingualPrimitiveFormField;

export type MultilingualFormFields<TData extends Base.FormInstrumentData> = {
  [K in keyof TData]: MultilingualFormField<TData[K]>;
};

export type MultilingualFormFieldsGroup<TData extends Base.FormInstrumentData> = {
  description?: { [L in Language]: string };
  fields: {
    [K in keyof TData]?: MultilingualFormField<TData[K]>;
  };
  title: { [L in Language]: string };
};

export type MultilingualFormContent<TData extends Base.FormInstrumentData> =
  | MultilingualFormFields<TData>
  | MultilingualFormFieldsGroup<TData>[];

export type MultilingualFormMeasures<TData extends Base.FormInstrumentData> = Record<
  string,
  Omit<Measure<TData>, 'label'> & {
    label: {
      [L in Language]: string;
    };
  }
>;

/** The definition of a multilingual form, which can be used to derive actual forms */
export type MultilingualForm<TData extends Base.FormInstrumentData> = Simplify<
  Omit<FormInstrument<TData>, 'content' | 'details' | 'kind' | 'measures'> & {
    content: MultilingualFormContent<TData>;
    details: MultilingualFormDetails;
    measures?: MultilingualFormMeasures<TData>;
  }
>;
