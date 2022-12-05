import { type FormikValues } from 'formik';

export type FormFieldVariant = 'date' | 'text' | 'select' | 'range';

export interface FormFieldProps {
  name: string;
  label: string;
  options?: { [key: string]: string };
}

export interface FormField extends FormFieldProps {
  name: string;
  label: string;
  variant: FormFieldVariant;
}

export type FormSubmitHandler = (values: FormikValues) => Promise<string>;

export interface FormProps {
  fields: FormField[];
  onSubmit: FormSubmitHandler;
}
