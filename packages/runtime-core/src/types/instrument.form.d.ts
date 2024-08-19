import type FormTypes from '@douglasneuroinformatics/libui-form-types';
import type { SetRequired, Simplify } from 'type-fest';

import type { Language } from './core.d.ts';
import type {
  InstrumentDetails,
  InstrumentLanguage,
  InstrumentMeasures,
  InstrumentUIOption,
  ScalarInstrument
} from './instrument.base.d.ts';

/** @public */
declare namespace FormInstrument {
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
        ? {
            description?: InstrumentUIOption<TLanguage, string>;
            label: InstrumentUIOption<TLanguage, string>;
          } & Omit<TBase, 'description' | 'label' | keyof TField> &
            TField
        : {
            description?: InstrumentUIOption<TLanguage, string>;
            label: InstrumentUIOption<TLanguage, string>;
          } & Omit<TBase, 'description' | 'label'>
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

/** @public */
declare type FormInstrument<
  TData extends FormInstrument.Data = FormInstrument.Data,
  TLanguage extends InstrumentLanguage = InstrumentLanguage
> = Simplify<
  {
    content: FormInstrument.Content<TData, TLanguage>;
    details: SetRequired<InstrumentDetails<TLanguage>, 'estimatedDuration'>;
    kind: 'FORM';
    measures: InstrumentMeasures<TData, TLanguage> | null;
  } & Omit<ScalarInstrument<TData, TLanguage>, 'details'>
>;

/** @internal */
declare type AnyUnilingualFormInstrument = FormInstrument<FormInstrument.Data, Language>;

/** @internal */
declare type AnyMultilingualFormInstrument = FormInstrument<FormInstrument.Data, Language[]>;

export type { AnyMultilingualFormInstrument, AnyUnilingualFormInstrument, FormInstrument, FormTypes };
