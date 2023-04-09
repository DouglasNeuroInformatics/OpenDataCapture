export type FormFieldKind = 'text' | 'numeric' | 'options' | 'date' | 'binary' | 'array';

export type PrimitiveFieldValue = string | number | boolean;

export type ArrayFieldValue = Record<string, PrimitiveFieldValue>[];

export type FormInstrumentData = Record<string, PrimitiveFieldValue | ArrayFieldValue>;

export type DependentConditions<T extends PrimitiveFieldValue = PrimitiveFieldValue> = {
  equals: T;
};

export type DependsOn<TData extends FormInstrumentData = FormInstrumentData> = {
  [K in keyof TData]?: [TData[K]] extends [PrimitiveFieldValue]
    ? DependentConditions<TData[K]>
    : TData[K] extends ArrayFieldValue
    ? Array<{
        [P in keyof TData[K][number]]?: DependentConditions<TData[K][number][P]>;
      }>
    : DependentConditions | Array<Record<string, DependentConditions>>;
};

export interface BaseFormField<TData extends FormInstrumentData = FormInstrumentData> {
  /** Discriminator key */
  kind: FormFieldKind;

  /** The label to be displayed to the user */
  label: string;

  /** An optional description of this field */
  description?: string;

  /** Whether or not the field is required */
  isRequired?: boolean;

  dependsOn?: DependsOn<TData>;
}

export interface TextFormField<TData extends FormInstrumentData = FormInstrumentData> extends BaseFormField<TData> {
  kind: 'text';
  variant: 'short' | 'long' | 'password';
}

export interface NumericFormField<TData extends FormInstrumentData = FormInstrumentData> extends BaseFormField<TData> {
  kind: 'numeric';
  min: number;
  max: number;
}

export interface OptionsFormField<TValue extends string = string, TData extends FormInstrumentData = FormInstrumentData>
  extends BaseFormField<TData> {
  kind: 'options';
  options: Record<TValue, string>;
}

export interface DateFormField<TData extends FormInstrumentData = FormInstrumentData> extends BaseFormField<TData> {
  kind: 'date';
}

export interface BinaryFormField<TData extends FormInstrumentData = FormInstrumentData> extends BaseFormField<TData> {
  kind: 'binary';
}

/** A field where the underlying value of the field data is of type FormFieldValue */
export type PrimitiveFormField<
  TValue extends PrimitiveFieldValue = PrimitiveFieldValue,
  TData extends FormInstrumentData = FormInstrumentData
> = TValue extends string
  ? TextFormField<TData> | OptionsFormField<TValue, TData> | DateFormField<TData>
  : TValue extends number
  ? NumericFormField<TData>
  : TValue extends boolean
  ? BinaryFormField<TData>
  : never;

export interface ArrayFormField<
  TValue extends ArrayFieldValue = ArrayFieldValue,
  TData extends FormInstrumentData = FormInstrumentData
> extends BaseFormField<TData> {
  kind: 'array';
  fieldset: {
    [K in keyof TValue[number]]: PrimitiveFormField<TValue[number][K], TData>;
  };
}

export type FormField<TValue, TData extends FormInstrumentData> = [TValue] extends [PrimitiveFieldValue]
  ? PrimitiveFormField<TValue, TData>
  : TValue extends ArrayFieldValue
  ? ArrayFormField<TValue, TData>
  : never;

export type FormFields<TData extends FormInstrumentData = FormInstrumentData> = {
  [K in keyof TData]: FormField<TData[K], TData>;
};

export type FormFieldsGroup<TData extends FormInstrumentData = FormInstrumentData> = {
  title: string;
  fields: {
    [K in keyof TData]?: FormField<TData[K], TData>;
  };
};
