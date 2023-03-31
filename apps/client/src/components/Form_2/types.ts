import { BaseFormField, FormInstrumentData  } from '@ddcp/common';

/** Omit property K across all objects in union T */
export type DistributiveOmit<T, K extends keyof any> = T extends any ? Omit<T, K> : never;

/** Common props for all field components */
export interface BaseFieldProps extends BaseFormField {
  name: string;
}

/** An object mapping field names to error messages, if applicable */
export type FormErrors<T extends FormInstrumentData> = {
  [K in keyof T]?: string;
};
