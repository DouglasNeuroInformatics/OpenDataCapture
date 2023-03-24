/** Defines the common properties across all form field types */
interface BaseFormField {
  /** Discriminator key */
  kind: string;

  /** The name of the key in the data object
   * @example
   * sex
   */
  name: string;

  /** The label to be displayed to the user
   * @example
   * Sex at Birth
   */
  label: string;

  /** An optional description of this field
   * @example
   * Please enter your sex at birth
   */
  description: string;
}

export interface StringFormField extends BaseFormField {
  kind: 'string';
  variant: 'short' | 'long' | 'password';
}

export interface NumberFormField extends BaseFormField {
  kind: 'number';
  variant: 'slider';
}

export interface SelectField extends BaseFormField {
  kind: 'select';
  variant: 'default';
  options: string[];
}

export type FormField = StringFormField | NumberFormField | SelectField;
