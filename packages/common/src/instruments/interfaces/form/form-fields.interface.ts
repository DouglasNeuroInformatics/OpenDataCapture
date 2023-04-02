export type FormFieldKind = 'text' | 'numeric' | 'options' | 'date' | 'binary' | 'complex';

export type FormFieldValue = string | number | boolean;

export type FormInstrumentData = Record<string, FormFieldValue | Record<string, FormFieldValue>>;

export interface BaseFormField {
  /** Discriminator key */
  kind: FormFieldKind;

  /** The label to be displayed to the user */
  label: string;

  /** An optional description of this field */
  description?: string;

  /** Whether or not the field is required */
  isRequired?: boolean;
}

export interface TextFormField extends BaseFormField {
  kind: 'text';
  variant: 'short' | 'long' | 'password';
}

export interface NumericFormField extends BaseFormField {
  kind: 'numeric';
  variant: 'default' | 'slider';
}

export interface OptionsFormField<T extends string = string> extends BaseFormField {
  kind: 'options';
  options: T[];
}

export interface DateFormField extends BaseFormField {
  kind: 'date';
}

export interface BinaryFormField extends BaseFormField {
  kind: 'binary';
}

/** A field where the underlying value of the field data is of type FormFieldValue */
export type PrimitiveFormField<T extends FormFieldValue> = T extends string
  ? TextFormField | OptionsFormField<T> | DateFormField
  : T extends number
  ? NumericFormField
  : T extends boolean
  ? BinaryFormField
  : never;

export interface ComplexFormField<T extends Record<string, FormFieldValue>> {
  kind: 'complex';
  fieldset: {
    [K in keyof T]: PrimitiveFormField<T[K]>;
  };
}

export type FormField<T = any> = [T] extends [FormFieldValue]
  ? PrimitiveFormField<T>
  : T extends Record<string, FormFieldValue>
  ? ComplexFormField<T>
  : never;

export type FormFields<T extends FormInstrumentData = FormInstrumentData> = {
  [K in keyof T]: FormField<T[K]>;
};

export type FormFieldsGroup<T extends FormInstrumentData = FormInstrumentData> = {
  title?: string;
  fields: {
    [K in keyof T]?: FormField<T[K]>;
  };
};
