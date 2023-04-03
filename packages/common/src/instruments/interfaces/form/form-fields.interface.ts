export type FormFieldKind = 'text' | 'numeric' | 'options' | 'date' | 'binary' | 'array';

export type PrimitiveFieldValue = string | number | boolean;

export type ArrayFieldValue = Record<string, PrimitiveFieldValue>[];

export type FormInstrumentData = Record<string, PrimitiveFieldValue | ArrayFieldValue>;

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
export type PrimitiveFormField<T extends PrimitiveFieldValue = PrimitiveFieldValue> = T extends string
  ? TextFormField | OptionsFormField<T> | DateFormField
  : T extends number
  ? NumericFormField
  : T extends boolean
  ? BinaryFormField
  : never;

export interface ArrayFormField<T extends ArrayFieldValue = ArrayFieldValue> {
  kind: 'array';
  fieldset: {
    [K in keyof T[number]]: PrimitiveFormField<T[number][K]>;
  };
}

export type FormField<T> = [T] extends [PrimitiveFieldValue]
  ? PrimitiveFormField<T>
  : T extends ArrayFieldValue
  ? ArrayFormField<T>
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
