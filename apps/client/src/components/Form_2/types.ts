import { ArrayFieldValue, BaseFormField, FormInstrumentData, PrimitiveFieldValue } from '@ddcp/common';

/** Omit property K across all objects in union T */
export type DistributiveOmit<T, K extends keyof any> = T extends any ? Omit<T, K> : never;

/** Common props for all field components */
export interface BaseFieldProps extends BaseFormField {
  name: string;
}

/** An object mapping field names to error messages, if applicable 
export type FormErrors<T extends FormInstrumentData = FormInstrumentData> = {
  [K in keyof T]?: T[K] extends PrimitiveF
    ? string
    : {
        [P in keyof T[K]]: string;
      };
};
*/

export type NullablePrimitiveFieldValue = PrimitiveFieldValue | null;

export type NullableArrayFieldValue = Record<string, NullablePrimitiveFieldValue>[];

export type FormValues<T extends FormInstrumentData> = {
  [K in keyof T]: NullablePrimitiveFieldValue | NullableArrayFieldValue;
};
