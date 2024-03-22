import type {
  BaseFormField,
  BooleanFormField,
  DateFormField,
  NumberFormField,
  RequiredFieldValue,
  ScalarFieldValue,
  SetFormField,
  StaticFieldKind,
  StringFormField
} from '@douglasneuroinformatics/libui-form-types';
import type { Simplify } from 'type-fest';
import { z } from 'zod';

import { $$InstrumentUIOption, type InstrumentLanguage, type InstrumentUIOption } from './instrument.base.js';

const $StaticFieldKind = z.enum([
  'string',
  'number',
  'boolean',
  'number-record',
  'record-array',
  'date',
  'set'
]) satisfies z.ZodType<StaticFieldKind>;

/**
 * Utility type to implement one of the core field types defined in `@douglasneuroinformatics/libui-form-types`
 *
 * @typeParam TLanguage - the language(s) of the instrument
 * @typeParam TBase - the base field type that this field corresponds to
 * @typeParam TField - optional extensions to the multilingual base type, only applying to union members with the keys
 */
type FormInstrumentFieldMixin<
  TLanguage extends InstrumentLanguage,
  TBase extends BaseFormField,
  TField extends object = object
> = Simplify<
  TBase extends any
    ? Extract<keyof TField, string> extends Extract<keyof TBase, string>
      ? Omit<TBase, 'description' | 'label' | keyof TField> & {
          description?: InstrumentUIOption<TLanguage, string>;
          label: InstrumentUIOption<TLanguage, string>;
        } & TField
      : Omit<TBase, 'description' | 'label'> & {
          description?: InstrumentUIOption<TLanguage, string>;
          label: InstrumentUIOption<TLanguage, string>;
        }
    : never
>;

const $FormInstrumentBaseField = z.object({
  description: $$InstrumentUIOption(z.string().min(1)).optional(),
  isRequired: z.boolean().optional(),
  kind: $StaticFieldKind,
  label: $$InstrumentUIOption(z.string().min(1))
}) satisfies z.ZodType<FormInstrumentFieldMixin<InstrumentLanguage, BaseFormField>>;

export type FormInstrumentStringField<
  TLanguage extends InstrumentLanguage = InstrumentLanguage,
  TValue extends string = string
> = FormInstrumentFieldMixin<
  TLanguage,
  StringFormField,
  {
    options: InstrumentUIOption<
      TLanguage,
      {
        [K in TValue]: string;
      }
    >;
  }
>;

export const $FormInstrumentStringField = z.union([
  $FormInstrumentBaseField.extend({
    kind: z.literal('string'),
    options: $$InstrumentUIOption(z.record(z.string().min(1))),
    variant: z.enum(['radio', 'select'])
  }),
  $FormInstrumentBaseField.extend({
    kind: z.literal('string'),
    variant: z.enum(['input', 'password', 'textarea'])
  })
]) satisfies z.ZodType<FormInstrumentStringField>;

export type FormInstrumentNumberField<
  TLanguage extends InstrumentLanguage = InstrumentLanguage,
  TValue extends number = number
> = FormInstrumentFieldMixin<
  TLanguage,
  NumberFormField,
  {
    options: InstrumentUIOption<
      TLanguage,
      {
        [K in TValue]: string;
      }
    >;
  }
>;

export const $FormInstrumentNumberField = z.union([
  $FormInstrumentBaseField.extend({
    kind: z.literal('number'),
    max: z.number().int(),
    min: z.number().int(),
    variant: z.literal('slider')
  }),
  $FormInstrumentBaseField.extend({
    kind: z.literal('number'),
    max: z.number().optional(),
    min: z.number().optional(),
    variant: z.literal('input')
  }),
  $FormInstrumentBaseField.extend({
    kind: z.literal('number'),
    options: $$InstrumentUIOption(z.record(z.string().min(1))),
    variant: z.literal('radio')
  })
]) satisfies z.ZodType<FormInstrumentNumberField>;

export type FormInstrumentDateField<TLanguage extends InstrumentLanguage = InstrumentLanguage> =
  FormInstrumentFieldMixin<TLanguage, DateFormField>;
export const $FormInstrumentDateField = $FormInstrumentBaseField.extend({
  kind: z.literal('date')
}) satisfies z.ZodType<FormInstrumentDateField>;

export type FormInstrumentBooleanField<TLanguage extends InstrumentLanguage = InstrumentLanguage> =
  FormInstrumentFieldMixin<
    TLanguage,
    BooleanFormField,
    {
      options?: InstrumentUIOption<
        TLanguage,
        {
          false: string;
          true: string;
        }
      >;
    }
  >;

export const $FormInstrumentBooleanField = z.union([
  $FormInstrumentBaseField.extend({
    kind: z.literal('boolean'),
    variant: z.literal('checkbox')
  }),
  $FormInstrumentBaseField.extend({
    kind: z.literal('boolean'),
    options: $$InstrumentUIOption(
      z.object({
        false: z.string().min(1),
        true: z.string().min(1)
      })
    ).optional(),
    variant: z.literal('radio')
  })
]) satisfies z.ZodType<FormInstrumentBooleanField>;

export type FormInstrumentSetField<
  TLanguage extends InstrumentLanguage = InstrumentLanguage,
  TValue extends Set<string> = Set<string>
> = FormInstrumentFieldMixin<
  TLanguage,
  SetFormField<TValue>,
  {
    options: TValue extends Set<infer TItem extends string>
      ? InstrumentUIOption<
          TLanguage,
          {
            [K in TItem]: string;
          }
        >
      : never;
  }
>;
export const $FormInstrumentSetField = $FormInstrumentBaseField.extend({
  kind: z.literal('set'),
  options: $$InstrumentUIOption(z.record(z.string().min(1))),
  variant: z.enum(['listbox', 'select'])
}) satisfies z.ZodType<FormInstrumentSetField>;

/**
 * Conditional type representing a static field corresponding for a `ScalarFieldValue`
 *
 * @typeParam TLanguage - the language(s) of the instrument
 * @typeParam TValue - the value corresponding to this field in `FormDataType`, excluding undefined
 */
export type ScalarFormField<
  TLanguage extends InstrumentLanguage = InstrumentLanguage,
  TValue extends RequiredFieldValue<ScalarFieldValue> = RequiredFieldValue<ScalarFieldValue>
> = TValue extends object
  ? TValue extends Date
    ? FormInstrumentDateField<TLanguage>
    : TValue extends Set<string>
      ? FormInstrumentSetField<TLanguage, TValue>
      : never
  : TValue extends string
    ? FormInstrumentStringField<TLanguage, TValue>
    : TValue extends number
      ? FormInstrumentNumberField<TLanguage, TValue>
      : TValue extends boolean
        ? FormInstrumentBooleanField<TLanguage>
        : never;

// export type DynamicFieldsetField<
//   TFieldsetValue extends FieldsetValue,
//   TValue extends RequiredFieldValue<ScalarFieldValue>
// > = {
//   kind: 'dynamic';
//   render: (fieldset: Partial<TFieldsetValue>) => ScalarFormField<TValue> | null;
// };

// export type Fieldset<TFieldsetValue extends NonNullableRecord<FieldsetValue>> = {
//   [K in keyof TFieldsetValue]:
//     | DynamicFieldsetField<TFieldsetValue, TFieldsetValue[K]>
//     | ScalarFormField<TFieldsetValue[K]>;
// };

// export type RecordArrayFormField<
//   TValue extends RequiredFieldValue<RecordArrayFieldValue> = RequiredFieldValue<RecordArrayFieldValue>
// > = FormFieldMixin<{
//   fieldset: Fieldset<TValue[number]>;
//   kind: 'record-array';
// }>;

// export type NumberRecordFormField<
//   TValue extends RequiredFieldValue<NumberRecordFieldValue> = RequiredFieldValue<NumberRecordFieldValue>
// > = FormFieldMixin<{
//   items: {
//     [K in keyof TValue]: {
//       description?: string;
//       label: string;
//     };
//   };
//   kind: 'number-record';
//   options: { [key: number]: string };
//   variant: 'likert';
// }>;

// export type CompositeFormField<TValue extends RequiredFieldValue<CompositeFieldValue>> =
//   TValue extends RequiredFieldValue<RecordArrayFieldValue>
//     ? RecordArrayFormField<TValue>
//     : TValue extends RequiredFieldValue<NumberRecordFieldValue>
//       ? NumberRecordFormField<TValue>
//       : never;

// export type StaticFormField<TValue extends RequiredFieldValue> =
//   TValue extends RequiredFieldValue<ScalarFieldValue>
//     ? ScalarFormField<TValue>
//     : TValue extends RequiredFieldValue<CompositeFieldValue>
//       ? TValue extends RequiredFieldValue<RecordArrayFieldValue>
//         ? RecordArrayFormField<TValue>
//         : TValue extends RequiredFieldValue<NumberRecordFieldValue>
//           ? NumberRecordFormField<TValue>
//           : never
//       : never;

// export type StaticFormFields<
//   TData extends FormDataType,
//   TRequiredData extends RequiredFormDataType<TData> = RequiredFormDataType<TData>
// > = {
//   [K in keyof TRequiredData]: StaticFormField<TRequiredData[K]>;
// };

// export type DynamicFormField<TData extends FormDataType, TValue extends RequiredFieldValue = RequiredFieldValue> = {
//   deps: readonly Extract<keyof TData, string>[];
//   kind: 'dynamic';
//   render: (data: PartialFormDataType<TData> | null) => StaticFormField<TValue> | null;
// };

// export type UnknownFormField<
//   TData extends FormDataType = FormDataType,
//   TKey extends keyof TData = keyof TData,
//   TRequiredData extends RequiredFormDataType<TData> = RequiredFormDataType<TData>
// > = DynamicFormField<TData, TRequiredData[TKey]> | StaticFormField<TRequiredData[TKey]>;

// export type FormFields<TData extends FormDataType = FormDataType> = {
//   [K in keyof TData]-?: UnknownFormField<TData, K>;
// };

// export type FormFieldsGroup<TData extends FormDataType> = {
//   description?: string;
//   fields: {
//     [K in keyof TData]?: UnknownFormField<RequiredFormDataType<TData>, K>;
//   };
//   title: string;
// };

// export type FormContent<TData extends FormDataType = FormDataType> = FormFields<TData> | FormFieldsGroup<TData>[];
