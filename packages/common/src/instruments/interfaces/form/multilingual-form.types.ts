import { Simplify } from 'type-fest';

import { Language } from '../../../core';
import { Nullable } from '../../../utils';

import { FormDetails } from './form-details.types';
import * as BaseTypes from './form-fields.types';
import { FormInstrument } from './form-instrument.types';

type MultilingualFormDetails = Simplify<
  Pick<FormDetails, 'estimatedDuration'> & {
    [K in keyof Pick<FormDetails, 'description' | 'instructions' | 'title'>]: {
      [L in Language]: FormDetails[K];
    };
  }
>;

type MultilingualFormFieldMixin<T extends BaseTypes.BaseFormField, U extends object = object> = Simplify<
  Omit<T, keyof U | 'description' | 'label'> & {
    description?: { [L in Language]: string };
    label: { [L in Language]: string };
  } & U
>;

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

type MultilingualBinaryFormField = MultilingualFormFieldMixin<BaseTypes.BinaryFormField>;

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
  fields: {
    [K in keyof TData]?: MultilingualFormField<TData[K]>;
  };
};

export type MultilingualFormContent<TData extends BaseTypes.FormInstrumentData> =
  | MultilingualFormFields<TData>
  | MultilingualFormFieldsGroup<TData>[];

export type MultilingualForm<TData extends BaseTypes.FormInstrumentData> = Simplify<
  Omit<FormInstrument<TData>, 'details' | 'content' | 'kind'> & {
    details: MultilingualFormDetails;
    content: MultilingualFormContent<TData>;
  }
>;
