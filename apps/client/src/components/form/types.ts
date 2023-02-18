import { ArrayFieldProps } from './ArrayField';
import { DateFieldProps } from './DateField';
import { SelectFieldProps } from './SelectField';
import { TextFieldProps } from './TextField';

/** Common props for all field components */
type BaseFieldProps = {
  name: string;
  label: string;
};

/** The primitive values for in used when defining forms */
type FieldValue = string;

/** An object within the FormData structure, which may or may not contain nested records corresponding higher-order fields */
type FormDataRecord = Record<PropertyKey, FieldValue>;

/** The lowest-level fields, which may or may not be used in higher-order fields */
type PrimitiveFieldType<T extends FieldValue> =
  | Omit<TextFieldProps, 'name'>
  | Omit<SelectFieldProps<T>, 'name'>
  | Omit<DateFieldProps, 'name'>;

/** A higher-order field containing an arbitrary number of primitive fields */
type ArrayFieldType<T extends FormDataRecord[]> = Omit<ArrayFieldProps<T>, 'name'>;

/** Discriminates whether the field is a primitive or array type */
type FormFieldType<T> = [T] extends [FieldValue]
  ? PrimitiveFieldType<T>
  : T extends FormDataRecord[]
  ? ArrayFieldType<T>
  : never;

/** The fundamental data structure of the form, which informs the structure of the fields and schema */
type FormDataType = Record<PropertyKey, FieldValue | FormDataRecord[]>;

/** Defines the fields that should be rendered to the user  */
type FormFields<T extends FormDataType> = {
  [K in keyof T]?: FormFieldType<T[K]>;
};

/** The entire form structure to be rendered to the user, consisting of an array of groups */
type FormStructure<T extends FormDataType = FormDataType> = Array<{
  title?: string;
  fields: FormFields<T>;
}>;

export { BaseFieldProps, FormDataRecord, FormDataType, FormFields, FormStructure };
