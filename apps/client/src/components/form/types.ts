import { DateFieldProps } from './DateField';
import { SelectFieldProps } from './SelectField';
import { TextFieldProps } from './TextField';

type FormFieldType<T extends string> =
  | Omit<TextFieldProps, 'name'>
  | Omit<SelectFieldProps<T>, 'name'>
  | Omit<DateFieldProps, 'name'>;

export interface BaseFieldProps {
  name: string;
  label: string;
}

export interface FormDataType {
  [key: string]: string;
}

export type FormFields<T extends FormDataType> = {
  [K in keyof T]: FormFieldType<T[K]>;
};

export type PartialFormFields<T extends FormDataType> = {
  [K in keyof T]?: FormFieldType<T[K]>;
};

export type GroupedFormFields<T extends FormDataType> = Array<{
  title: string;
  fields: PartialFormFields<T>;
}>;
