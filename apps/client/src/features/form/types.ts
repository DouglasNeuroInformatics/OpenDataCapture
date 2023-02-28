/** Omit property K across all objects in union T */
export type DistributiveOmit<T, K extends keyof any> = T extends any ? Omit<T, K> : never;

/** The primitive values for in used when defining forms */
export type FieldValue = string | number | boolean | Date;

/** Common props for all field components */
export type BaseFieldProps<T extends FieldValue> = {
  kind: string;
  name: string;
  label: string;
  value: T;
  onChange: FieldChangeHandler<FormValues, T>;
  description?: string;
};

/** A record of the field names and the types of their values */
export type FormValues = Record<PropertyKey, FieldValue>;

export type FieldChangeHandler<T extends FormValues, U extends FieldValue = FieldValue> = (
  key: keyof T,
  value: U
) => void;
