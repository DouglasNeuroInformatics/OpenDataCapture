import { Simplify } from 'type-fest';

import { FormDetails } from './form-details.types';
import * as BaseTypes from './form-fields.types';
import { FormInstrument } from './form-instrument.types';

import { Language } from '@/core';
import { Nullable } from '@/utils';

/**
 * The details of the form to be displayed to the user. This corresponds to the same
 * properties as `FormDetails`, excluding language, but with multilingual options
 */
type MultilingualFormDetails = Simplify<
  Pick<FormDetails, 'estimatedDuration'> & {
    [K in keyof Pick<FormDetails, 'description' | 'instructions' | 'title'>]: {
      [L in Language]: FormDetails[K];
    };
  }
>;

type MultilingualFormFieldMixin<T, U extends object = object> = T extends BaseTypes.BaseFormField
  ? Simplify<
      Omit<T, keyof U | 'description' | 'label'> & {
        description?: { [L in Language]: string };
        label: { [L in Language]: string };
      } & U
    >
  : never;

type MultilingualTextFormField = MultilingualFormFieldMixin<BaseTypes.TextFormField>;

type MultilingualOptionsFormField<TValue extends string = string> = MultilingualFormFieldMixin<
  BaseTypes.OptionsFormField<TValue>,
  {
    options: {
      [L in Language]: {
        [K in TValue]: string;
      };
    };
  }
>;

type MultilingualDateFormField = MultilingualFormFieldMixin<BaseTypes.DateFormField>;

type MultilingualNumericFormField = MultilingualFormFieldMixin<BaseTypes.NumericFormField>;

type MultilingualBinaryFormField<T extends BaseTypes.BinaryFormField = BaseTypes.BinaryFormField> = T extends {
  variant: 'radio';
}
  ? MultilingualFormFieldMixin<
      T,
      {
        options?: {
          [L in Language]: {
            t: string;
            f: string;
          };
        };
      }
    >
  : MultilingualFormFieldMixin<T>;

type MultilingualPrimitiveFormField<TValue extends BaseTypes.PrimitiveFieldValue = BaseTypes.PrimitiveFieldValue> =
  TValue extends string
    ? MultilingualTextFormField | MultilingualOptionsFormField<TValue> | MultilingualDateFormField
    : TValue extends number
    ? MultilingualNumericFormField
    : TValue extends boolean
    ? MultilingualBinaryFormField
    : never;

type MultilingualArrayFieldset<T extends BaseTypes.ArrayFieldValue[number]> = {
  [K in keyof T]:
    | MultilingualPrimitiveFormField<T[K]>
    | ((fieldset: Nullable<T>) => MultilingualPrimitiveFormField<T[K]> | null);
};

type MultilingualArrayFormField<TValue extends BaseTypes.ArrayFieldValue = BaseTypes.ArrayFieldValue> =
  MultilingualFormFieldMixin<
    BaseTypes.ArrayFormField,
    {
      fieldset: MultilingualArrayFieldset<TValue[number]>;
    }
  >;

export type MultilingualFormField<TValue> = [TValue] extends [BaseTypes.PrimitiveFieldValue]
  ? MultilingualPrimitiveFormField<TValue>
  : [TValue] extends [BaseTypes.ArrayFieldValue]
  ? MultilingualArrayFormField<TValue>
  : MultilingualPrimitiveFormField | MultilingualArrayFormField;

export type MultilingualFormFields<TData extends BaseTypes.FormInstrumentData> = {
  [K in keyof TData]: MultilingualFormField<TData[K]>;
};

export type MultilingualFormFieldsGroup<TData extends BaseTypes.FormInstrumentData> = {
  title: { [L in Language]: string };
  description?: { [L in Language]: string };
  fields: {
    [K in keyof TData]?: MultilingualFormField<TData[K]>;
  };
};

export type MultilingualFormContent<TData extends BaseTypes.FormInstrumentData> =
  | MultilingualFormFields<TData>
  | MultilingualFormFieldsGroup<TData>[];

/** The definition of a multilingual form, which can be used to derive actual forms */
export type MultilingualForm<TData extends BaseTypes.FormInstrumentData> = Simplify<
  Omit<FormInstrument<TData>, 'details' | 'content' | 'kind'> & {
    details: MultilingualFormDetails;
    content: MultilingualFormContent<TData>;
  }
>;
