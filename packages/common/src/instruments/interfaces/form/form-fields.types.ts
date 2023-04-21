import { Simplify } from 'type-fest';

import { Nullable } from '../../../utils';

/** Discriminator key to determine the structure of a specific form field */
export type FormFieldKind = 'text' | 'numeric' | 'options' | 'date' | 'binary' | 'array';

/** The type of the data associated with a primitive field */
export type PrimitiveFieldValue = string | number | boolean;

/** The type of the data associated with an array field */
export type ArrayFieldValue = Record<string, PrimitiveFieldValue>[];

/** The type of the data associated with the entire instrument (i.e., the values for all fields) */
export type FormInstrumentData = Record<string, PrimitiveFieldValue | ArrayFieldValue>;

/** The basic properties common to all field kinds */
export type BaseFormField = {
  kind: FormFieldKind;

  /** The label to be displayed to the user */
  label: string;

  /** An optional description of this field */
  description?: string;

  /** Whether or not the field is required */
  isRequired?: boolean;
};

/** A helper type used to merge `BaseFormField` with `T` */
export type FormFieldMixin<T extends { kind: FormFieldKind }> = Simplify<BaseFormField & T>;

export type TextFormField = FormFieldMixin<{
  kind: 'text';
  variant: 'short' | 'long' | 'password';
}>;

export type NumericFormField = FormFieldMixin<{
  kind: 'numeric';
  min: number;
  max: number;
  variant: 'default' | 'slider';
}>;

export type OptionsFormField<TValue extends string = string> = FormFieldMixin<{
  kind: 'options';
  options: Record<TValue, string>;
}>;

export type DateFormField = FormFieldMixin<{
  kind: 'date';
}>;

export type BinaryFormField = FormFieldMixin<{
  kind: 'binary';
}>;

/** A field where the underlying value of the field data is of type FormFieldValue */
export type PrimitiveFormField<TValue extends PrimitiveFieldValue = PrimitiveFieldValue> = TValue extends string
  ? TextFormField | OptionsFormField<TValue> | DateFormField
  : TValue extends number
  ? NumericFormField
  : TValue extends boolean
  ? BinaryFormField
  : never;

export type ArrayFieldset<T extends ArrayFieldValue[number]> = {
  [K in keyof T]: PrimitiveFormField<T[K]> | ((fieldset: Nullable<T>) => PrimitiveFormField<T[K]> | null);
};
export type ArrayFormField<TValue extends ArrayFieldValue = ArrayFieldValue> = FormFieldMixin<{
  kind: 'array';
  fieldset: ArrayFieldset<TValue[number]>;
}>;

export type FormField<TValue extends ArrayFieldValue | PrimitiveFieldValue> = [TValue] extends [PrimitiveFieldValue]
  ? PrimitiveFormField<TValue>
  : [TValue] extends [ArrayFieldValue]
  ? ArrayFormField<TValue>
  : PrimitiveFormField | ArrayFormField;

export type FormFields<TData extends FormInstrumentData = FormInstrumentData> = {
  [K in keyof TData]: FormField<TData[K]>;
};

export type FormFieldsGroup<TData extends FormInstrumentData = FormInstrumentData> = {
  title: string;
  description?: string;
  fields: {
    [K in keyof TData]?: FormField<TData[K]>;
  };
};
