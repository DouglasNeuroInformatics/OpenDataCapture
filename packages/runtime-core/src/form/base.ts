/* eslint-disable @typescript-eslint/no-namespace */

import type { ConditionalKeys, IntRange, Merge, PartialDeep, SetRequired, Simplify } from 'type-fest';
import type { z as z3 } from 'zod/v3';
import type { z as z4 } from 'zod/v4';

type Language = 'en' | 'fr';

type InstrumentLanguage = Language | Language[];

type InstrumentUIOption<TLanguage extends InstrumentLanguage, TValue> = TLanguage extends Language
  ? TValue
  : TLanguage extends (infer L extends Language)[]
    ? { [K in L]: TValue }
    : never;

/**
 * An object containing the base details of any instrument to be displayed to the client. This may be
 * augmented in specific kinds of instruments, if applicable.
 * @public
 *
 * @typeParam TLanguage - the language(s) of the instrument
 */
type ClientInstrumentDetails<TLanguage extends InstrumentLanguage = InstrumentLanguage> = {
  /** An integer representing the estimated number of minutes for the average target subject to complete the instrument */
  estimatedDuration?: number;

  /** Brief sequential instructions for how the subject should complete the instrument. */
  instructions?: InstrumentUIOption<TLanguage, string[]>;

  /** The title of the instrument to show the client. If not specified, defaults to `details.title` */
  title?: InstrumentUIOption<TLanguage, string>;
};

type InstrumentDetails<TLanguage extends InstrumentLanguage = InstrumentLanguage> = {
  /** The legal person(s) that created the instrument and hold copyright to the instrument */
  authors?: null | string[];

  /** A brief description of the instrument, such as the purpose and history of the instrument */
  description: InstrumentUIOption<TLanguage, string>;

  /** An identifier corresponding to the SPDX license list version d2709ad (released on 2024-01-30) */
  license: string;

  /** An reference link where the user can learn more about the instrument */
  referenceUrl?: null | string;

  /** A URL where the user can find the source code for the instrument */
  sourceUrl?: null | string;

  /** The title of the instrument in the language it is written, omitting the definite article. */
  title: InstrumentUIOption<TLanguage, string>;
};

type BaseInstrument<TLanguage extends InstrumentLanguage = InstrumentLanguage> = {
  /** The runtime version for this instrument, which is set automatically by the `defineInstrument` function */
  __runtimeVersion: 1;
  /** The content in the instrument to be rendered to the client */
  clientDetails?: ClientInstrumentDetails<TLanguage>;
  /** The content in the instrument to be rendered to the clinician/researcher */
  content?: unknown;
  /** The details of the instrument to be displayed to the user */
  details: InstrumentDetails<TLanguage>;
  /** The database ID for the instrument. For scalar instruments, this is derived by the internal property. */
  id?: string;
  /** The discriminator key for the type of instrument */
  kind: 'FORM';
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

/** @public */
type InstrumentMeasureValue = boolean | Date | FormTypes.RecordArrayFieldValue[] | number | string | undefined;

/** @public */
type InstrumentMeasureVisibility = 'hidden' | 'visible';

/** @public */
type BaseInstrumentMeasure<TLanguage extends InstrumentLanguage> = {
  /** @deprecated use `visibility` */
  hidden?: boolean;
  label?: InstrumentUIOption<TLanguage, string>;
  visibility?: InstrumentMeasureVisibility;
};

/** @public */
type ComputedInstrumentMeasure<TData = any, TLanguage extends InstrumentLanguage = InstrumentLanguage> = SetRequired<
  BaseInstrumentMeasure<TLanguage>,
  'label'
> & {
  kind: 'computed';
  value: (data: TData) => InstrumentMeasureValue;
};

/** @public */
type ConstantInstrumentMeasure<
  TData = any,
  TLanguage extends InstrumentLanguage = InstrumentLanguage
> = BaseInstrumentMeasure<TLanguage> & {
  kind: 'const';
  ref: TData extends { [key: string]: any }
    ? ConditionalKeys<TData, InstrumentMeasureValue> extends infer K
      ? [K] extends [never]
        ? string
        : K
      : never
    : never;
};

/** @public */
type InstrumentMeasure<TData = any, TLanguage extends InstrumentLanguage = InstrumentLanguage> =
  | ComputedInstrumentMeasure<TData, TLanguage>
  | ConstantInstrumentMeasure<TData, TLanguage>;

/** @public */
type InstrumentMeasures<TData = any, TLanguage extends InstrumentLanguage = InstrumentLanguage> = {
  [key: string]: InstrumentMeasure<TData, TLanguage>;
};

/** @public */
type InstrumentValidationSchema<TData = any> = z3.ZodType<TData> | z4.ZodType<TData>;

type ScalarInstrument<TData = any, TLanguage extends InstrumentLanguage = InstrumentLanguage> = Merge<
  BaseInstrument<TLanguage>,
  {
    defaultMeasureVisibility?: InstrumentMeasureVisibility;

    internal: ScalarInstrumentInternal;

    /** Arbitrary measures derived from the data */
    measures: InstrumentMeasures<TData, TLanguage> | null;

    /** The zod validation schema for the instrument data */
    validationSchema: InstrumentValidationSchema<TData>;
  }
>;

declare namespace FormTypes {
  // INTERNAL UTILITIES
  export type NonNullableRecord<T> =
    NonNullable<T> extends infer U extends { [key: string]: unknown }
      ? {
          [K in keyof U]-?: NonNullable<U[K]>;
        }
      : never;

  // FIELD KINDS (DISCRIMINATOR KEY)

  export type StaticCompositeFieldKind = 'number-record' | 'record-array';

  export type StaticScalarFieldKind = 'boolean' | 'date' | 'number' | 'set' | 'string';

  export type StaticFieldKind = Simplify<StaticCompositeFieldKind | StaticScalarFieldKind>;

  // BASE DATA TYPES

  export type ScalarFieldValue = boolean | Date | number | Set<string> | string | undefined;

  export type FieldsetValue = { [key: string]: ScalarFieldValue };

  export type RecordArrayFieldValue = FieldsetValue[] | undefined;

  export type NumberRecordFieldValue = Partial<{ [key: string]: number }> | undefined;

  export type CompositeFieldValue = NumberRecordFieldValue | RecordArrayFieldValue;

  export type FieldValue = CompositeFieldValue | ScalarFieldValue;

  /** The type of the data associated with the entire instrument (i.e., the values for all fields) */
  export type Data = { [key: string]: FieldValue };

  // REQUIRED DATA TYPES

  export type RequiredFieldValue<TValue extends FieldValue = FieldValue> = TValue extends infer TScalarValue extends
    NonNullable<ScalarFieldValue>
    ? TScalarValue
    : TValue extends infer TCompositeValue extends NonNullable<CompositeFieldValue>
      ? TCompositeValue extends (infer TArrayItem)[]
        ? NonNullableRecord<TArrayItem>[]
        : NonNullableRecord<TCompositeValue>
      : never;

  export type OptionalFieldValue<
    TValue extends FieldValue = FieldValue,
    TNull extends null = never
  > = TValue extends infer TScalarValue extends NonNullable<ScalarFieldValue>
    ? TNull | TScalarValue | undefined
    : TValue extends infer TCompositeValue extends NonNullable<CompositeFieldValue>
      ? TCompositeValue extends (infer TArrayItem)[]
        ? Partial<TArrayItem>[] | TNull | undefined
        : Partial<TCompositeValue> | TNull | undefined
      : never;

  export type RequiredData<TData extends Data = Data> = {
    [K in keyof TData]-?: RequiredFieldValue<TData[K]>;
  };

  export type PartialData<TData extends Data = Data> = {
    [K in keyof TData]?: OptionalFieldValue<TData[K]>;
  };

  export type PartialNullableData<TData extends Data = Data> = {
    [K in keyof TData]?: OptionalFieldValue<TData[K], null>;
  };

  /** The basic properties common to all field kinds */
  export type BaseField = {
    /** An optional description of this field */
    description?: string;

    /** Whether or not the field is disabled */
    disabled?: boolean;

    /** Discriminator key */
    kind: StaticFieldKind;

    /** The label to be displayed to the user */
    label: string;
  };

  /**
   * A helper type used to merge `BaseField` with `T`, where kind determines
   * the data type stored in the form and variant determines what will be rendered
   * to the user, if applicable
   */
  export type FieldMixin<TField extends { kind: StaticFieldKind }> = Simplify<BaseField & TField>;

  export type StringField<TValue extends string = string> = FieldMixin<
    | {
        calculateStrength?: (this: void, password: string) => IntRange<0, 5>;
        kind: 'string';
        variant: 'password';
      }
    | {
        kind: 'string';
        options: { [K in TValue]: string };
        variant: 'radio' | 'select';
      }
    | {
        kind: 'string';
        placeholder?: string;
        variant: 'input' | 'textarea';
      }
  >;

  export type NumberField<TValue extends number = number> = FieldMixin<
    | {
        disableAutoPrefix?: boolean;
        kind: 'number';
        options: { [K in TValue]: string };
        variant: 'radio' | 'select';
      }
    | {
        kind: 'number';
        /** @deprecated - this should be defined in the validationSchema for better use feedback  */
        max?: number;
        /** @deprecated - this should be defined in the validationSchema for better use feedback  */
        min?: number;
        variant: 'input';
      }
    | {
        kind: 'number';
        max: number;
        min: number;
        variant: 'slider';
      }
  >;

  export type DateField = FieldMixin<{
    kind: 'date';
  }>;

  export type BooleanField = FieldMixin<
    | {
        kind: 'boolean';
        options?: {
          false: string;
          true: string;
        };
        variant: 'radio';
      }
    | {
        kind: 'boolean';
        variant: 'checkbox';
      }
  >;

  export type SetField<TValue extends Set<string> = Set<string>> = FieldMixin<{
    kind: 'set';
    options: TValue extends Set<infer TItem extends string>
      ? {
          [K in TItem]: string;
        }
      : never;
    variant: 'listbox' | 'select';
  }>;

  export type AnyScalarField = BooleanField | DateField | NumberField | SetField | StringField;

  /** A field where the underlying value of the field data is of type ScalarFieldValue */
  export type ScalarField<TValue extends RequiredFieldValue<ScalarFieldValue> = RequiredFieldValue<ScalarFieldValue>> =
    [TValue] extends [object]
      ? [TValue] extends [Date]
        ? DateField
        : [TValue] extends [Set<string>]
          ? SetField<TValue>
          : never
      : [TValue] extends [string]
        ? StringField<TValue>
        : [TValue] extends [number]
          ? NumberField<TValue>
          : [TValue] extends [boolean]
            ? BooleanField
            : AnyScalarField;

  export type DynamicFieldsetField<
    TFieldsetValue extends FieldsetValue,
    TValue extends RequiredFieldValue<ScalarFieldValue>
  > = {
    kind: 'dynamic';
    render: (this: void, fieldset: Partial<TFieldsetValue>) => null | ScalarField<TValue>;
  };

  export type Fieldset<TFieldsetValue extends NonNullableRecord<FieldsetValue>> = {
    [K in keyof TFieldsetValue]:
      | DynamicFieldsetField<TFieldsetValue, TFieldsetValue[K]>
      | ScalarField<TFieldsetValue[K]>;
  };

  export type RecordArrayField<
    TValue extends RequiredFieldValue<RecordArrayFieldValue> = RequiredFieldValue<RecordArrayFieldValue>
  > = FieldMixin<{
    fieldset: Fieldset<TValue[number]>;
    kind: 'record-array';
  }>;

  export type NumberRecordField<
    TValue extends RequiredFieldValue<NumberRecordFieldValue> = RequiredFieldValue<NumberRecordFieldValue>
  > = FieldMixin<{
    items: {
      [K in keyof TValue]: {
        description?: string;
        label: string;
      };
    };
    kind: 'number-record';
    options: { [key: number]: string };
    variant: 'likert';
  }>;

  export type CompositeField<TValue extends RequiredFieldValue<CompositeFieldValue>> =
    TValue extends RequiredFieldValue<RecordArrayFieldValue>
      ? RecordArrayField<TValue>
      : TValue extends RequiredFieldValue<NumberRecordFieldValue>
        ? NumberRecordField<TValue>
        : never;

  export type AnyStaticField =
    | BooleanField
    | DateField
    | NumberField
    | NumberRecordField
    | RecordArrayField
    | SetField
    | StringField;

  export type StaticField<TValue extends RequiredFieldValue = RequiredFieldValue> = [TValue] extends [
    RequiredFieldValue<ScalarFieldValue>
  ]
    ? ScalarField<TValue>
    : [TValue] extends [RequiredFieldValue<CompositeFieldValue>]
      ? [TValue] extends [RequiredFieldValue<RecordArrayFieldValue>]
        ? RecordArrayField<TValue>
        : [TValue] extends [RequiredFieldValue<NumberRecordFieldValue>]
          ? NumberRecordField<TValue>
          : never
      : AnyStaticField;

  export type StaticFields<TData extends Data, TRequiredData extends RequiredData<TData> = RequiredData<TData>> = {
    [K in keyof TRequiredData]: StaticField<TRequiredData[K]>;
  };

  export type DynamicField<TData extends Data, TValue extends RequiredFieldValue = RequiredFieldValue> = {
    deps: readonly Extract<keyof TData, string>[];
    kind: 'dynamic';
    render: (this: void, data: PartialData<TData>) => null | StaticField<TValue>;
  };

  export type UnknownField<
    TData extends Data = Data,
    TKey extends keyof TData = keyof TData,
    TRequiredData extends RequiredData<TData> = RequiredData<TData>
  > = DynamicField<TData, TRequiredData[TKey]> | StaticField<TRequiredData[TKey]>;

  export type Fields<TData extends Data = Data> = {
    [K in keyof TData]-?: UnknownField<TData, K>;
  };

  export type FieldsGroup<TData extends Data> = {
    description?: string;
    fields: {
      [K in keyof TData]?: UnknownField<RequiredData<TData>, K>;
    };
    title?: string;
  };

  export type Content<TData extends Data = Data> = Fields<TData> | FieldsGroup<TData>[];
}

export declare namespace FormInstrument {
  export type Data = FormTypes.Data;
  export type PartialData<TData extends Data = Data> = FormTypes.PartialData<TData>;

  /**
   * Utility type to implement one of the core field types defined in `@douglasneuroinformatics/libui-form-types`
   *
   * @typeParam TLanguage - the language(s) of the instrument
   * @typeParam TBase - the base field type that this field corresponds to
   * @typeParam TField - optional extensions to the multilingual base type, only applying to union members with the keys
   */
  export type FieldMixin<
    TLanguage extends InstrumentLanguage,
    TBase extends FormTypes.BaseField,
    TField extends object = object
  > = Simplify<
    TBase extends any
      ? Extract<keyof TField, string> extends Extract<keyof TBase, string>
        ? Omit<TBase, 'description' | 'label' | keyof TField> &
            TField & {
              description?: InstrumentUIOption<TLanguage, string>;
              label: InstrumentUIOption<TLanguage, string>;
            }
        : Omit<TBase, 'description' | 'label'> & {
            description?: InstrumentUIOption<TLanguage, string>;
            label: InstrumentUIOption<TLanguage, string>;
          }
      : never
  >;

  type StringField<
    TLanguage extends InstrumentLanguage = InstrumentLanguage,
    TValue extends string = string
  > = FieldMixin<
    TLanguage,
    FormTypes.StringField,
    {
      options: InstrumentUIOption<
        TLanguage,
        {
          [K in TValue]: string;
        }
      >;
    }
  >;

  type NumberField<
    TLanguage extends InstrumentLanguage = InstrumentLanguage,
    TValue extends number = number
  > = FieldMixin<
    TLanguage,
    FormTypes.NumberField,
    {
      options: InstrumentUIOption<
        TLanguage,
        {
          [K in TValue]: string;
        }
      >;
    }
  >;

  type DateField<TLanguage extends InstrumentLanguage = InstrumentLanguage> = FieldMixin<
    TLanguage,
    FormTypes.DateField
  >;

  type BooleanField<TLanguage extends InstrumentLanguage = InstrumentLanguage> = FieldMixin<
    TLanguage,
    FormTypes.BooleanField,
    {
      options?: InstrumentUIOption<
        TLanguage,
        {
          false: string;
          true: string;
        }
      >;
    }
  >;

  type SetField<
    TLanguage extends InstrumentLanguage = InstrumentLanguage,
    TValue extends Set<string> = Set<string>
  > = FieldMixin<
    TLanguage,
    FormTypes.SetField<TValue>,
    {
      options: TValue extends Set<infer TItem extends string>
        ? InstrumentUIOption<
            TLanguage,
            {
              [K in TItem]: string;
            }
          >
        : never;
    }
  >;

  type AnyScalarField<TLanguage extends InstrumentLanguage = InstrumentLanguage> =
    | BooleanField<TLanguage>
    | DateField<TLanguage>
    | NumberField<TLanguage>
    | SetField<TLanguage>
    | StringField<TLanguage>;

  /**
   * Conditional type representing a static field corresponding for a `ScalarFieldValue`
   *
   * @typeParam TLanguage - the language(s) of the instrument
   * @typeParam TValue - the value corresponding to this field in `Data`, excluding undefined
   */
  type ScalarField<
    TLanguage extends InstrumentLanguage = InstrumentLanguage,
    TValue extends
      FormTypes.RequiredFieldValue<FormTypes.ScalarFieldValue> = FormTypes.RequiredFieldValue<FormTypes.ScalarFieldValue>
  > = [TValue] extends [object]
    ? [TValue] extends [Date]
      ? DateField<TLanguage>
      : [TValue] extends [Set<string>]
        ? SetField<TLanguage, TValue>
        : never
    : [TValue] extends [string]
      ? StringField<TLanguage, TValue>
      : [TValue] extends [number]
        ? NumberField<TLanguage, TValue>
        : [TValue] extends [boolean]
          ? BooleanField<TLanguage>
          : AnyScalarField<TLanguage>;

  type DynamicFieldsetField<
    TLanguage extends InstrumentLanguage = InstrumentLanguage,
    TFieldsetValue extends FormTypes.FieldsetValue = FormTypes.FieldsetValue,
    TValue extends
      FormTypes.RequiredFieldValue<FormTypes.ScalarFieldValue> = FormTypes.RequiredFieldValue<FormTypes.ScalarFieldValue>
  > = {
    kind: 'dynamic';
    render: (this: void, fieldset: Partial<TFieldsetValue>) => null | ScalarField<TLanguage, TValue>;
  };

  type Fieldset<
    TLanguage extends InstrumentLanguage = InstrumentLanguage,
    TFieldset extends { [key: string]: NonNullable<FormTypes.ScalarFieldValue> } = {
      [key: string]: NonNullable<FormTypes.ScalarFieldValue>;
    }
  > = {
    [K in keyof TFieldset]:
      | DynamicFieldsetField<TLanguage, TFieldset, TFieldset[K]>
      | ScalarField<TLanguage, TFieldset[K]>;
  };

  type RecordArrayField<
    TLanguage extends InstrumentLanguage = InstrumentLanguage,
    TValue extends
      FormTypes.RequiredFieldValue<FormTypes.RecordArrayFieldValue> = FormTypes.RequiredFieldValue<FormTypes.RecordArrayFieldValue>
  > = FieldMixin<
    TLanguage,
    FormTypes.RecordArrayField<TValue>,
    {
      fieldset: Fieldset<TLanguage, TValue[number]>;
    }
  >;

  type NumberRecordField<
    TLanguage extends InstrumentLanguage = InstrumentLanguage,
    TValue extends
      FormTypes.RequiredFieldValue<FormTypes.NumberRecordFieldValue> = FormTypes.RequiredFieldValue<FormTypes.NumberRecordFieldValue>
  > = FieldMixin<
    TLanguage,
    FormTypes.NumberRecordField,
    {
      items: {
        [K in keyof TValue]: {
          description?: InstrumentUIOption<TLanguage, string>;
          label: InstrumentUIOption<TLanguage, string>;
        };
      };
      kind: 'number-record';
      options: InstrumentUIOption<
        TLanguage,
        {
          [key: number]: string;
        }
      >;
      variant: 'likert';
    }
  >;

  type CompositeField<
    TLanguage extends InstrumentLanguage = InstrumentLanguage,
    TValue extends
      FormTypes.RequiredFieldValue<FormTypes.CompositeFieldValue> = FormTypes.RequiredFieldValue<FormTypes.CompositeFieldValue>
  > =
    TValue extends FormTypes.RequiredFieldValue<FormTypes.RecordArrayFieldValue>
      ? RecordArrayField<TLanguage, TValue>
      : TValue extends FormTypes.RequiredFieldValue<FormTypes.NumberRecordFieldValue>
        ? NumberRecordField<TLanguage, TValue>
        : never;

  type AnyStaticField<TLanguage extends InstrumentLanguage = InstrumentLanguage> =
    | BooleanField<TLanguage>
    | DateField<TLanguage>
    | NumberField<TLanguage>
    | NumberRecordField<TLanguage>
    | RecordArrayField<TLanguage>
    | SetField<TLanguage>
    | StringField<TLanguage>;

  type StaticField<
    TLanguage extends InstrumentLanguage = InstrumentLanguage,
    TValue extends FormTypes.RequiredFieldValue = FormTypes.RequiredFieldValue
  > = [TValue] extends [FormTypes.RequiredFieldValue<FormTypes.ScalarFieldValue>]
    ? ScalarField<TLanguage, TValue>
    : [TValue] extends [FormTypes.RequiredFieldValue<FormTypes.CompositeFieldValue>]
      ? [TValue] extends [FormTypes.RequiredFieldValue<FormTypes.RecordArrayFieldValue>]
        ? RecordArrayField<TLanguage, TValue>
        : [TValue] extends [FormTypes.RequiredFieldValue<FormTypes.NumberRecordFieldValue>]
          ? NumberRecordField<TLanguage, TValue>
          : never
      : AnyStaticField<TLanguage>;

  type DynamicField<
    TData extends Data = Data,
    TValue extends FormTypes.RequiredFieldValue = FormTypes.RequiredFieldValue,
    TLanguage extends InstrumentLanguage = InstrumentLanguage
  > = {
    deps: readonly Extract<keyof TData, string>[];
    kind: 'dynamic';
    render: (this: void, data: FormTypes.PartialData<TData>) => null | StaticField<TLanguage, TValue>;
  };

  type AnyField =
    | BooleanField
    | DateField
    | DynamicField
    | NumberField
    | NumberRecordField
    | RecordArrayField
    | SetField
    | StringField;

  type UnknownField<
    TData extends Data = Data,
    TKey extends keyof TData = keyof TData,
    TLanguage extends InstrumentLanguage = InstrumentLanguage
  > =
    FormTypes.RequiredData<TData> extends infer TRequiredData extends FormTypes.RequiredData<TData>
      ? DynamicField<TData, TRequiredData[TKey], TLanguage> | StaticField<TLanguage, TRequiredData[TKey]>
      : never;

  type Fields<TData extends Data = Data, TLanguage extends InstrumentLanguage = InstrumentLanguage> = {
    [K in keyof TData]-?: UnknownField<TData, K, TLanguage>;
  };

  type FieldsGroup<TData extends Data = Data, TLanguage extends InstrumentLanguage = InstrumentLanguage> = {
    description?: InstrumentUIOption<TLanguage, string>;
    fields: {
      [K in keyof TData]?: UnknownField<TData, K, TLanguage>;
    };
    title?: InstrumentUIOption<TLanguage, string>;
  };

  type Content<TData extends Data = Data, TLanguage extends InstrumentLanguage = InstrumentLanguage> =
    | Fields<TData, TLanguage>
    | FieldsGroup<TData, TLanguage>[];
}

export declare type FormInstrument<
  TData extends FormInstrument.Data = FormInstrument.Data,
  TLanguage extends InstrumentLanguage = InstrumentLanguage
> = Simplify<
  ScalarInstrument<TData, TLanguage> & {
    content: FormInstrument.Content<TData, TLanguage>;
    initialValues?: PartialDeep<TData>;
    kind: 'FORM';
    measures: InstrumentMeasures<TData, TLanguage> | null;
  }
>;
