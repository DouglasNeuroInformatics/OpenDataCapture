import { ArrayFieldValue, FormInstrumentData, PrimitiveFieldValue } from '@douglasneuroinformatics/common';

export type NullablePrimitiveFieldValue<T extends PrimitiveFieldValue = PrimitiveFieldValue> = T | null;

export type NullableArrayFieldValue<T extends ArrayFieldValue = ArrayFieldValue> = Array<{
  [K in keyof T[number]]: NullablePrimitiveFieldValue<T[number][K]>;
}>;

/** Common props for all field components */
export interface BaseFieldProps<T> {
  name: string;
  value: T;
  setValue: (value: T) => void;
  error?: T extends NullableArrayFieldValue
    ? Record<string, string>[]
    : T extends NullablePrimitiveFieldValue
    ? string
    : never;
}

/** An object mapping field names to error messages, if applicable */
export type FormErrors<T extends FormInstrumentData = FormInstrumentData> = {
  [K in keyof T]?: string | Record<string, string>[];
};

export type FormValues<T extends FormInstrumentData = FormInstrumentData> = {
  [K in keyof T]: T[K] extends PrimitiveFieldValue
    ? NullablePrimitiveFieldValue<T[K]>
    : T[K] extends ArrayFieldValue
    ? NullableArrayFieldValue<T[K]>
    : T[K] extends PrimitiveFieldValue | ArrayFieldValue
    ? NullablePrimitiveFieldValue | NullableArrayFieldValue
    : never;
};
