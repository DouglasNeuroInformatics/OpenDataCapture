import type * as Base from '@douglasneuroinformatics/form-types';
import type { IsEqual, KeysOfUnion, Simplify } from 'type-fest';
import { z } from 'zod';

import { $ZodTypeAny } from './core';
import {
  $BaseInstrument,
  $EnhancedBaseInstrumentDetails,
  $InstrumentUIOption,
  type BaseInstrument,
  type BaseInstrumentSummary,
  type EnhancedBaseInstrumentDetails,
  type InstrumentLanguage,
  type InstrumentUIOption
} from './instrument.base';

export const $FormFieldKind = z.enum([
  'options',
  'date',
  'array',
  'binary',
  'numeric',
  'text'
]) satisfies z.ZodType<Base.FormFieldKind>;

/**
 * Utility type to implement one of the core field types defined in `@douglasneuroinformatics/form-types`.
 * This is necessary due to the possibility of multilingual form instruments. Essentially, this type just
 * wraps UI text with the `InstrumentUIOption` utility.
 *
 * @typeParam TLanguage - the language(s) of the instrument
 * @typeParam TBase - the base field type that this field corresponds to
 * @typeParam TField - optional extensions to the multilingual base type
 */
type FormInstrumentFieldMixin<
  TLanguage extends InstrumentLanguage,
  TBase extends Base.BaseFormField,
  TField extends object = object
> = Simplify<
  Omit<TBase, 'description' | 'label' | keyof TField> & {
    description?: InstrumentUIOption<TLanguage, string>;
    label: InstrumentUIOption<TLanguage, string>;
  } & TField
>;

const $FormInstrumentBaseField = z.object({
  description: $InstrumentUIOption(z.string().min(1)).optional(),
  isRequired: z.boolean().optional(),
  kind: $FormFieldKind,
  label: $InstrumentUIOption(z.string().min(1))
});

export type FormInstrumentTextField<TLanguage extends InstrumentLanguage = InstrumentLanguage> =
  FormInstrumentFieldMixin<TLanguage, Base.TextFormField>;

export const $FormInstrumentTextField = $FormInstrumentBaseField.extend({
  kind: z.literal('text'),
  variant: z.enum(['long', 'password', 'short'])
}) satisfies z.ZodType<FormInstrumentTextField>;

export type FormInstrumentOptionsField<
  TLanguage extends InstrumentLanguage = InstrumentLanguage,
  TValue extends string = string
> = FormInstrumentFieldMixin<
  TLanguage,
  Base.OptionsFormField<TValue>,
  {
    options: InstrumentUIOption<
      TLanguage,
      {
        [K in TValue]: string;
      }
    >;
  }
>;

export const $FormInstrumentOptionsField = $FormInstrumentBaseField.extend({
  kind: z.literal('options'),
  options: $InstrumentUIOption(z.record(z.string().min(1)))
}) satisfies z.ZodType<FormInstrumentOptionsField>;

export type FormInstrumentDateField<TLanguage extends InstrumentLanguage = InstrumentLanguage> =
  FormInstrumentFieldMixin<TLanguage, Base.DateFormField>;

export const $FormInstrumentDateField = $FormInstrumentBaseField.extend({
  kind: z.literal('date')
}) satisfies z.ZodType<FormInstrumentDateField>;

export type FormInstrumentNumericField<TLanguage extends InstrumentLanguage = InstrumentLanguage> =
  | FormInstrumentFieldMixin<TLanguage, Extract<Base.NumericFormField, { variant: 'default' }>>
  | FormInstrumentFieldMixin<TLanguage, Extract<Base.NumericFormField, { variant: 'slider' }>>;

export const $FormInstrumentNumericField = $FormInstrumentBaseField.extend({
  kind: z.literal('numeric'),
  max: z.number(),
  min: z.number(),
  variant: z.enum(['default', 'slider'])
}) satisfies z.ZodType<FormInstrumentNumericField>;

export type FormInstrumentBinaryField<
  TLanguage extends InstrumentLanguage = InstrumentLanguage,
  TField extends Base.BinaryFormField = Base.BinaryFormField
> = TField extends {
  variant: 'checkbox';
}
  ? FormInstrumentFieldMixin<TLanguage, TField>
  : FormInstrumentFieldMixin<
      TLanguage,
      TField,
      {
        options?: InstrumentUIOption<
          TLanguage,
          {
            f: string;
            t: string;
          }
        >;
      }
    >;

export const $FormInstrumentBinaryField = $FormInstrumentBaseField.extend({
  kind: z.literal('binary'),
  options: $InstrumentUIOption(
    z.object({
      f: z.string().min(1),
      t: z.string().min(1)
    })
  ).optional(),
  variant: z.enum(['checkbox', 'radio'])
}) satisfies z.ZodType<FormInstrumentBinaryField>;

/**
 * Conditional type representing a static field corresponding for a `PrimitiveFieldValue`
 *
 * @typeParam TLanguage - the language(s) of the instrument
 * @typeParam TValue - the value corresponding to this field in `FormDataType`, excluding undefined
 */
export type FormInstrumentPrimitiveField<
  TLanguage extends InstrumentLanguage = InstrumentLanguage,
  TValue extends Base.RequiredPrimitiveFieldValue = Base.RequiredPrimitiveFieldValue
> = TValue extends Date
  ? FormInstrumentDateField<TLanguage>
  : TValue extends string
    ? FormInstrumentOptionsField<TLanguage, TValue> | FormInstrumentTextField<TLanguage>
    : TValue extends number
      ? FormInstrumentNumericField<TLanguage>
      : TValue extends boolean
        ? FormInstrumentBinaryField<TLanguage>
        : never;

export const $FormInstrumentPrimitiveField = z.union([
  $FormInstrumentTextField,
  $FormInstrumentOptionsField,
  $FormInstrumentDateField,
  $FormInstrumentNumericField,
  $FormInstrumentBinaryField
]) satisfies z.ZodType<FormInstrumentPrimitiveField>;

export type FormInstrumentDynamicFieldsetField<
  TLanguage extends InstrumentLanguage = InstrumentLanguage,
  TFieldset extends Base.ArrayFieldsetValue = Base.ArrayFieldsetValue,
  TValue extends Base.RequiredPrimitiveFieldValue = Base.RequiredPrimitiveFieldValue
> = {
  kind: 'dynamic-fieldset';
  render: (fieldset: Partial<TFieldset>) => FormInstrumentPrimitiveField<TLanguage, TValue> | null;
};

export const $FormInstrumentDynamicFieldsetField = z.object({
  kind: z.literal('dynamic-fieldset'),
  render: z.function().args(z.any()).returns($FormInstrumentPrimitiveField)
}) satisfies z.ZodType<FormInstrumentDynamicFieldsetField>;

export type FormInstrumentArrayFieldset<
  TLanguage extends InstrumentLanguage = InstrumentLanguage,
  TFieldset extends Base.RequiredArrayFieldsetValue = Base.RequiredArrayFieldsetValue
> = {
  [K in keyof TFieldset]:
    | FormInstrumentDynamicFieldsetField<TLanguage, TFieldset, TFieldset[K]>
    | FormInstrumentPrimitiveField<TLanguage, TFieldset[K]>;
};

export const $FormInstrumentArrayFieldset = z.record(
  z.union([$FormInstrumentDynamicFieldsetField, $FormInstrumentPrimitiveField])
) satisfies z.ZodType<FormInstrumentArrayFieldset>;

export type FormInstrumentArrayField<
  TLanguage extends InstrumentLanguage = InstrumentLanguage,
  TValue extends Base.RequiredArrayFieldValue = Base.RequiredArrayFieldValue
> = FormInstrumentFieldMixin<
  TLanguage,
  Base.ArrayFormField<TValue>,
  {
    fieldset: FormInstrumentArrayFieldset<TLanguage, TValue[number]>;
  }
>;

export const $FormInstrumentArrayField = $FormInstrumentBaseField.extend({
  fieldset: $FormInstrumentArrayFieldset,
  kind: z.literal('array')
}) satisfies z.ZodType<FormInstrumentArrayField>;

export type FormInstrumentStaticField<
  TLanguage extends InstrumentLanguage = InstrumentLanguage,
  TValue extends Base.RequiredFormFieldValue = Base.RequiredFormFieldValue
> = TValue extends Base.RequiredPrimitiveFieldValue
  ? FormInstrumentPrimitiveField<TLanguage, TValue>
  : TValue extends Base.RequiredArrayFieldValue
    ? FormInstrumentArrayField<TLanguage, TValue>
    : FormInstrumentArrayField<TLanguage> | FormInstrumentPrimitiveField<TLanguage>;

export const $FormInstrumentStaticField = z.union([
  $FormInstrumentArrayField,
  $FormInstrumentPrimitiveField
]) satisfies z.ZodType<FormInstrumentStaticField>;

export type FormInstrumentStaticFields<
  TData extends Base.FormDataType = Base.FormDataType,
  TLanguage extends InstrumentLanguage = InstrumentLanguage,
  TRequiredData extends Base.RequiredFormDataType<TData> = Base.RequiredFormDataType<TData>
> = {
  [K in keyof TRequiredData]: FormInstrumentStaticField<TLanguage, TRequiredData[K]>;
};

export const $FormInstrumentStaticFields = z.record(
  $FormInstrumentStaticField
) satisfies z.ZodType<FormInstrumentStaticFields>;

export type FormInstrumentDynamicField<
  TData extends Base.FormDataType = Base.FormDataType,
  TValue extends Base.RequiredFormFieldValue = Base.RequiredFormFieldValue,
  TLanguage extends InstrumentLanguage = InstrumentLanguage
> = {
  deps: readonly Extract<keyof TData, string>[];
  kind: 'dynamic';
  render: (data: Base.PartialFormDataType<TData> | null) => FormInstrumentStaticField<TLanguage, TValue> | null;
};

export const $FormInstrumentDynamicField = z.object({
  deps: z.array(z.string()),
  kind: z.literal('dynamic'),
  render: z
    .function()
    .args(z.any())
    .returns(z.union([$FormInstrumentStaticField, z.null()]))
}) satisfies z.ZodType<FormInstrumentDynamicField>;

export type FormInstrumentUnknownField<
  TData extends Base.FormDataType = Base.FormDataType,
  TKey extends keyof TData = keyof TData,
  TLanguage extends InstrumentLanguage = InstrumentLanguage,
  TRequiredData extends Base.RequiredFormDataType<TData> = Base.RequiredFormDataType<TData>
> =
  | FormInstrumentDynamicField<TData, TRequiredData[TKey], TLanguage>
  | FormInstrumentStaticField<TLanguage, TRequiredData[TKey]>;

export const $FormInstrumentUnknownField = z.union([
  $FormInstrumentDynamicField,
  $FormInstrumentStaticField
]) satisfies z.ZodType<FormInstrumentUnknownField>;

export type FormInstrumentFields<
  TData extends Base.FormDataType = Base.FormDataType,
  TLanguage extends InstrumentLanguage = InstrumentLanguage
> = {
  [K in keyof TData]-?: FormInstrumentUnknownField<TData, K, TLanguage>;
};

export const $FormInstrumentFields = z.record($FormInstrumentUnknownField) satisfies z.ZodType<FormInstrumentFields>;

export type FormInstrumentFieldsGroup<
  TData extends Base.FormDataType = Base.FormDataType,
  TLanguage extends InstrumentLanguage = InstrumentLanguage
> = {
  description?: InstrumentUIOption<TLanguage, string>;
  fields: {
    [K in keyof TData]?: FormInstrumentUnknownField<TData, K, TLanguage>;
  };
  title: InstrumentUIOption<TLanguage, string>;
};

export const $FormInstrumentFieldsGroup = z.object({
  description: $InstrumentUIOption(z.string().min(1)).optional(),
  fields: $FormInstrumentFields,
  title: $InstrumentUIOption(z.string().min(1))
}) satisfies z.ZodType<FormInstrumentFieldsGroup>;

export type FormInstrumentContent<
  TData extends Base.FormDataType = Base.FormDataType,
  TLanguage extends InstrumentLanguage = InstrumentLanguage
> = FormInstrumentFields<TData, TLanguage> | FormInstrumentFieldsGroup<TData, TLanguage>[];

export const $FormInstrumentContent = z.union([
  $FormInstrumentFields,
  $FormInstrumentFieldsGroup.array()
]) satisfies z.ZodType<FormInstrumentContent>;

export type FormInstrumentMeasures<
  TData extends Base.FormDataType = Base.FormDataType,
  TLanguage extends InstrumentLanguage = InstrumentLanguage
> = Record<
  string,
  {
    label: InstrumentUIOption<TLanguage, string>;
    value: (data: TData) => number;
  }
>;

export const $FormInstrumentMeasures = z.record(
  z.object({
    label: $InstrumentUIOption(z.string()),
    value: z.function().args(z.any()).returns(z.number())
  })
) satisfies z.ZodType<FormInstrumentMeasures>;

type ReservedKey = KeysOfUnion<FormInstrumentStaticField>;

/**
 * Utility type that recursively checks for all reserved keys in `TData`
 */
type IsValidFormData<
  TData extends Base.FormDataType,
  TRequiredData extends Base.RequiredFormDataType<TData> = Base.RequiredFormDataType<TData>
> = IsEqual<
  TRequiredData,
  {
    [K in keyof TRequiredData as K extends ReservedKey
      ? never
      : K]: TRequiredData[K] extends Base.RequiredPrimitiveFieldValue
      ? TRequiredData[K]
      : TRequiredData[K] extends Base.RequiredArrayFieldValue
        ? {
            [P in keyof TRequiredData[K][number] as P extends ReservedKey ? never : P]: TRequiredData[K][number][P];
          }[]
        : never;
  }
>;

export type FormInstrument<
  TData extends Base.FormDataType = Base.FormDataType,
  TLanguage extends InstrumentLanguage = InstrumentLanguage
> = Simplify<
  Omit<BaseInstrument<TData, TLanguage>, 'details'> & {
    content: FormInstrumentContent<TData, TLanguage>;
    details: EnhancedBaseInstrumentDetails<TLanguage>;
    kind: 'FORM';
    measures?: FormInstrumentMeasures<TData, TLanguage>;
  }
>;

export const $FormInstrument = $BaseInstrument().extend({
  content: $FormInstrumentContent,
  details: $EnhancedBaseInstrumentDetails(),
  kind: z.literal('FORM'),
  measures: $FormInstrumentMeasures.optional(),
  validationSchema: $ZodTypeAny
}) satisfies z.ZodType<FormInstrument>;

export type StrictFormInstrument<TData, TLanguage extends InstrumentLanguage> = TData extends Base.FormDataType
  ? IsValidFormData<TData> extends true
    ? Omit<FormInstrument<TData, TLanguage>, 'validationSchema'> & {
        validationSchema: z.ZodObject<{
          [K in keyof TData]: NonNullable<TData[K]> extends Base.PrimitiveFieldValue
            ? z.ZodType<TData[K]>
            : NonNullable<TData[K]> extends Base.ArrayFieldValue
              ? z.ZodArray<
                  z.ZodObject<{
                    [P in keyof NonNullable<TData[K]>[number]]: z.ZodType<NonNullable<TData[K]>[number][P]>;
                  }>
                >
              : never;
        }>;
      }
    : never
  : never;

export type FormInstrumentSummary<
  TData extends Base.FormDataType = Base.FormDataType,
  TLanguage extends InstrumentLanguage = InstrumentLanguage
> = BaseInstrumentSummary<FormInstrument<TData, TLanguage>> & {
  measures?: Record<
    string,
    {
      label: InstrumentUIOption<TLanguage, string>;
    }
  >;
};
