import { FormFieldKind } from '../../enums/form-field-kind.enum';
import { NumberFieldVariant } from '../../enums/number-field-variant.enum';
import { StringFieldVariant } from '../../enums/string-field-variant.enum';

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

export interface StringFormField extends BaseFormField {
  kind: FormFieldKind.String;
  variant: StringFieldVariant;
}

export interface NumberFormField extends BaseFormField {
  kind: FormFieldKind.Number;
  variant: NumberFieldVariant;
}

export interface SelectField extends BaseFormField {
  kind: FormFieldKind.Select;
  options: string[];
}

export type FormField = StringFormField | NumberFormField | SelectField;

export type FormFieldType = string | number;
