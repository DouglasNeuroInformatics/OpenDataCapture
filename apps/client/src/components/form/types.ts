import { DateFieldProps } from './DateField';
import { SelectFieldProps } from './SelectField';
import { TextFieldProps } from './TextField';

export interface BaseFieldProps {
  kind: unknown;
  name: string;
  label: string;
}

export interface FormDataType {
  [key: string]: string;
}

export type FormTextFieldType = Omit<TextFieldProps, 'name'>;

// where T should be a union of the options for the field
export type FormSelectFieldType<T extends string> = Omit<SelectFieldProps<T>, 'name'>;

export type FormDateFieldType = Omit<DateFieldProps, 'name'>;

export type FormFields<T extends FormDataType> = {
  [K in keyof T]: FormTextFieldType | FormSelectFieldType<T[K]> | FormDateFieldType;
};
