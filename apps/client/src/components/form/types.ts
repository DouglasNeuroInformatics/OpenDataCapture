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

export type FormFields<T extends FormDataType> = {
  [K in keyof T]: Omit<TextFieldProps, 'name'> | Omit<SelectFieldProps<T[K]>, 'name'> | Omit<DateFieldProps, 'name'>;
};
