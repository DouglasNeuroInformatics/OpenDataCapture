import { BaseFormField, FormFieldType } from '@ddcp/common';

/** Omit property K across all objects in union T */
export type DistributiveOmit<T, K extends keyof any> = T extends any ? Omit<T, K> : never;

/** Common props for all field components */
export interface BaseFieldProps extends BaseFormField {
  name: string;
}

/** A record of the field names and the types of their values */
export interface FormValues {
  [field: string]: FormFieldType;
}

/** An object mapping field names to error messages, if applicable */
export type FormErrors<T extends FormValues = FormValues> = {
  [K in keyof T]?: string;
};
