import FormTypes from '@douglasneuroinformatics/libui-form-types';
import type { SetRequired, Simplify } from 'type-fest';

import type { Language } from './core.d.ts';
import type {
  InstrumentDetails,
  InstrumentLanguage,
  InstrumentMeasures,
  InstrumentUIOption,
  ScalarInstrument
} from './instrument.base.d.ts';

/**
 * Utility type to implement one of the core field types defined in `@douglasneuroinformatics/libui-form-types`
 * @public
 *
 * @typeParam TLanguage - the language(s) of the instrument
 * @typeParam TBase - the base field type that this field corresponds to
 * @typeParam TField - optional extensions to the multilingual base type, only applying to union members with the keys
 */
type FormInstrumentFieldMixin<
  TLanguage extends InstrumentLanguage,
  TBase extends FormTypes.BaseFormField,
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

/** @public */
type FormInstrumentStringField<
  TLanguage extends InstrumentLanguage = InstrumentLanguage,
  TValue extends string = string
> = FormInstrumentFieldMixin<
  TLanguage,
  FormTypes.StringFormField,
  {
    options: InstrumentUIOption<
      TLanguage,
      {
        [K in TValue]: string;
      }
    >;
  }
>;

/** @public */
type FormInstrumentNumberField<
  TLanguage extends InstrumentLanguage = InstrumentLanguage,
  TValue extends number = number
> = FormInstrumentFieldMixin<
  TLanguage,
  FormTypes.NumberFormField,
  {
    options: InstrumentUIOption<
      TLanguage,
      {
        [K in TValue]: string;
      }
    >;
  }
>;

/** @public */
type FormInstrumentDateField<TLanguage extends InstrumentLanguage = InstrumentLanguage> = FormInstrumentFieldMixin<
  TLanguage,
  FormTypes.DateFormField
>;

/** @public */
type FormInstrumentBooleanField<TLanguage extends InstrumentLanguage = InstrumentLanguage> = FormInstrumentFieldMixin<
  TLanguage,
  FormTypes.BooleanFormField,
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

/** @public */
type FormInstrumentSetField<
  TLanguage extends InstrumentLanguage = InstrumentLanguage,
  TValue extends Set<string> = Set<string>
> = FormInstrumentFieldMixin<
  TLanguage,
  FormTypes.SetFormField<TValue>,
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

/** @public */
type AnyFormInstrumentScalarField<TLanguage extends InstrumentLanguage = InstrumentLanguage> =
  | FormInstrumentBooleanField<TLanguage>
  | FormInstrumentDateField<TLanguage>
  | FormInstrumentNumberField<TLanguage>
  | FormInstrumentSetField<TLanguage>
  | FormInstrumentStringField<TLanguage>;

/**
 * Conditional type representing a static field corresponding for a `FormTypes.ScalarFieldValue`
 * @public
 *
 * @typeParam TLanguage - the language(s) of the instrument
 * @typeParam TValue - the value corresponding to this field in `FormTypes.FormDataType`, excluding undefined
 */
type FormInstrumentScalarField<
  TLanguage extends InstrumentLanguage = InstrumentLanguage,
  TValue extends
    FormTypes.RequiredFieldValue<FormTypes.ScalarFieldValue> = FormTypes.RequiredFieldValue<FormTypes.ScalarFieldValue>
> = [TValue] extends [object]
  ? [TValue] extends [Date]
    ? FormInstrumentDateField<TLanguage>
    : [TValue] extends [Set<string>]
      ? FormInstrumentSetField<TLanguage, TValue>
      : never
  : [TValue] extends [string]
    ? FormInstrumentStringField<TLanguage, TValue>
    : [TValue] extends [number]
      ? FormInstrumentNumberField<TLanguage, TValue>
      : [TValue] extends [boolean]
        ? FormInstrumentBooleanField<TLanguage>
        : AnyFormInstrumentScalarField<TLanguage>;

/** @public */
type FormInstrumentDynamicFieldsetField<
  TLanguage extends InstrumentLanguage = InstrumentLanguage,
  TFieldsetValue extends FormTypes.FieldsetValue = FormTypes.FieldsetValue,
  TValue extends
    FormTypes.RequiredFieldValue<FormTypes.ScalarFieldValue> = FormTypes.RequiredFieldValue<FormTypes.ScalarFieldValue>
> = {
  kind: 'dynamic';
  render: (this: void, fieldset: Partial<TFieldsetValue>) => FormInstrumentScalarField<TLanguage, TValue> | null;
};

/** @public */
type FormInstrumentFieldset<
  TLanguage extends InstrumentLanguage = InstrumentLanguage,
  TFieldset extends { [key: string]: NonNullable<FormTypes.ScalarFieldValue> } = {
    [key: string]: NonNullable<FormTypes.ScalarFieldValue>;
  }
> = {
  [K in keyof TFieldset]:
    | FormInstrumentDynamicFieldsetField<TLanguage, TFieldset, TFieldset[K]>
    | FormInstrumentScalarField<TLanguage, TFieldset[K]>;
};

/** @public */
type FormInstrumentRecordArrayField<
  TLanguage extends InstrumentLanguage = InstrumentLanguage,
  TValue extends
    FormTypes.RequiredFieldValue<FormTypes.RecordArrayFieldValue> = FormTypes.RequiredFieldValue<FormTypes.RecordArrayFieldValue>
> = FormInstrumentFieldMixin<
  TLanguage,
  FormTypes.RecordArrayFormField<TValue>,
  {
    fieldset: FormInstrumentFieldset<TLanguage, TValue[number]>;
  }
>;

/** @public */
type FormInstrumentNumberRecordField<
  TLanguage extends InstrumentLanguage = InstrumentLanguage,
  TValue extends
    FormTypes.RequiredFieldValue<FormTypes.NumberRecordFieldValue> = FormTypes.RequiredFieldValue<FormTypes.NumberRecordFieldValue>
> = FormInstrumentFieldMixin<
  TLanguage,
  FormTypes.NumberRecordFormField,
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

/** @public */
type FormInstrumentCompositeField<
  TLanguage extends InstrumentLanguage = InstrumentLanguage,
  TValue extends
    FormTypes.RequiredFieldValue<FormTypes.CompositeFieldValue> = FormTypes.RequiredFieldValue<FormTypes.CompositeFieldValue>
> =
  TValue extends FormTypes.RequiredFieldValue<FormTypes.RecordArrayFieldValue>
    ? FormInstrumentRecordArrayField<TLanguage, TValue>
    : TValue extends FormTypes.RequiredFieldValue<FormTypes.NumberRecordFieldValue>
      ? FormInstrumentNumberRecordField<TLanguage, TValue>
      : never;

/** @public */
type AnyFormInstrumentStaticField<TLanguage extends InstrumentLanguage = InstrumentLanguage> =
  | FormInstrumentBooleanField<TLanguage>
  | FormInstrumentDateField<TLanguage>
  | FormInstrumentNumberField<TLanguage>
  | FormInstrumentNumberRecordField<TLanguage>
  | FormInstrumentRecordArrayField<TLanguage>
  | FormInstrumentSetField<TLanguage>
  | FormInstrumentStringField<TLanguage>;

/** @public */
type FormInstrumentStaticField<
  TLanguage extends InstrumentLanguage = InstrumentLanguage,
  TValue extends FormTypes.RequiredFieldValue = FormTypes.RequiredFieldValue
> = [TValue] extends [FormTypes.RequiredFieldValue<FormTypes.ScalarFieldValue>]
  ? FormInstrumentScalarField<TLanguage, TValue>
  : [TValue] extends [FormTypes.RequiredFieldValue<FormTypes.CompositeFieldValue>]
    ? [TValue] extends [FormTypes.RequiredFieldValue<FormTypes.RecordArrayFieldValue>]
      ? FormInstrumentRecordArrayField<TLanguage, TValue>
      : [TValue] extends [FormTypes.RequiredFieldValue<FormTypes.NumberRecordFieldValue>]
        ? FormInstrumentNumberRecordField<TLanguage, TValue>
        : never
    : AnyFormInstrumentStaticField<TLanguage>;

/** @public */
type FormInstrumentDynamicField<
  TData extends FormTypes.FormDataType = FormTypes.FormDataType,
  TValue extends FormTypes.RequiredFieldValue = FormTypes.RequiredFieldValue,
  TLanguage extends InstrumentLanguage = InstrumentLanguage
> = {
  deps: readonly Extract<keyof TData, string>[];
  kind: 'dynamic';
  render: (
    this: void,
    data: FormTypes.PartialFormDataType<TData>
  ) => FormInstrumentStaticField<TLanguage, TValue> | null;
};

/** @public */
type AnyFormInstrumentField =
  | FormInstrumentBooleanField
  | FormInstrumentDateField
  | FormInstrumentDynamicField
  | FormInstrumentNumberField
  | FormInstrumentNumberRecordField
  | FormInstrumentRecordArrayField
  | FormInstrumentSetField
  | FormInstrumentStringField;

/** @public */
type FormInstrumentUnknownField<
  TData extends FormTypes.FormDataType = FormTypes.FormDataType,
  TKey extends keyof TData = keyof TData,
  TLanguage extends InstrumentLanguage = InstrumentLanguage
> =
  FormTypes.RequiredFormDataType<TData> extends infer TRequiredData extends FormTypes.RequiredFormDataType<TData>
    ?
        | FormInstrumentDynamicField<TData, TRequiredData[TKey], TLanguage>
        | FormInstrumentStaticField<TLanguage, TRequiredData[TKey]>
    : never;

/** @public */
type FormInstrumentFields<
  TData extends FormTypes.FormDataType = FormTypes.FormDataType,
  TLanguage extends InstrumentLanguage = InstrumentLanguage
> = {
  [K in keyof TData]-?: FormInstrumentUnknownField<TData, K, TLanguage>;
};

/** @public */
type FormInstrumentFieldsGroup<
  TData extends FormTypes.FormDataType = FormTypes.FormDataType,
  TLanguage extends InstrumentLanguage = InstrumentLanguage
> = {
  description?: InstrumentUIOption<TLanguage, string>;
  fields: {
    [K in keyof TData]?: FormInstrumentUnknownField<TData, K, TLanguage>;
  };
  title?: InstrumentUIOption<TLanguage, string>;
};

/** @public */
type FormInstrumentContent<
  TData extends FormTypes.FormDataType = FormTypes.FormDataType,
  TLanguage extends InstrumentLanguage = InstrumentLanguage
> = FormInstrumentFields<TData, TLanguage> | FormInstrumentFieldsGroup<TData, TLanguage>[];

/** @public */
type FormInstrument<
  TData extends FormTypes.FormDataType = FormTypes.FormDataType,
  TLanguage extends InstrumentLanguage = InstrumentLanguage
> = Simplify<
  {
    content: FormInstrumentContent<TData, TLanguage>;
    details: SetRequired<InstrumentDetails<TLanguage>, 'estimatedDuration'>;
    kind: 'FORM';
    measures: InstrumentMeasures<TData, TLanguage> | null;
  } & Omit<ScalarInstrument<TData, TLanguage>, 'details'>
>;

/** @public */
type AnyUnilingualFormInstrument = FormInstrument<FormTypes.FormDataType, Language>;

/** @public */
type AnyMultilingualFormInstrument = FormInstrument<FormTypes.FormDataType, Language[]>;

export type {
  AnyFormInstrumentField,
  AnyFormInstrumentScalarField,
  AnyFormInstrumentStaticField,
  AnyMultilingualFormInstrument,
  AnyUnilingualFormInstrument,
  FormInstrument,
  FormInstrumentBooleanField,
  FormInstrumentCompositeField,
  FormInstrumentContent,
  FormInstrumentDateField,
  FormInstrumentDynamicField,
  FormInstrumentDynamicFieldsetField,
  FormInstrumentFieldMixin,
  FormInstrumentFields,
  FormInstrumentFieldset,
  FormInstrumentFieldsGroup,
  FormInstrumentNumberField,
  FormInstrumentNumberRecordField,
  FormInstrumentRecordArrayField,
  FormInstrumentScalarField,
  FormInstrumentSetField,
  FormInstrumentStaticField,
  FormInstrumentStringField,
  FormInstrumentUnknownField,
  FormTypes
};
