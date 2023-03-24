import { FormFieldKind } from '@/instruments/enums/form-field-kind.enum';

export interface BaseFormField {
  /** Discriminator key */
  kind: FormFieldKind;

  /** The name of the key in the data object */
  name: string;

  /** The label to be displayed to the user */
  label: string;

  /** An optional description of this field */
  description?: string;
}

export interface StringFormField extends BaseFormField {
  kind: FormFieldKind.String;
  variant: 'short' | 'long' | 'password';
}

export interface NumberFormField extends BaseFormField {
  kind: FormFieldKind.Number;
  variant: 'slider';
}

export interface SelectField extends BaseFormField {
  kind: FormFieldKind.Select;
  options: string[];
}

export type FormField = StringFormField | NumberFormField | SelectField;
