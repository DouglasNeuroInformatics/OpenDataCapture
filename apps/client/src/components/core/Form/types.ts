import { SelectFieldProps } from './SelectField';
import { TextFieldProps } from './TextField';

export type FormDataType = Record<string, any>;

export type FormFields<T extends FormDataType> = {
  [K in keyof T]: Omit<TextFieldProps, 'name'> | Omit<SelectFieldProps<T[K]>, 'name'>;
};
