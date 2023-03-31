import { BaseFormField, FormFieldValue, FormInstrumentData } from '@ddcp/common';

/** Omit property K across all objects in union T */
export type DistributiveOmit<T, K extends keyof any> = T extends any ? Omit<T, K> : never;

export type DeepPartial<T> = T extends object
  ? {
      [P in keyof T]?: DeepPartial<T[P]>;
    }
  : T;

/** Common props for all field components */
export interface BaseFieldProps extends BaseFormField {
  name: string;
}

/** An object mapping field names to error messages, if applicable */
export type FormErrors<T extends FormInstrumentData = FormInstrumentData> = {
  [K in keyof T]?: T[K] extends FormFieldValue
    ? string
    : {
        [P in keyof T[K]]: string;
      };
};

export type FormValues<T extends FormInstrumentData = FormInstrumentData> = DeepPartial<T>;
