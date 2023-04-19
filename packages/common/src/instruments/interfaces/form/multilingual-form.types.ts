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

type MultilingualOptionsFormField<TValue extends string = string> = Simplify<
  Omit<BaseTypes.OptionsFormField<TValue>, 'options'> & {
    options: { [L in Language]: Record<TValue, string> };
  }
>;
type MultilingualPrimitiveFormField<TValue extends BaseTypes.PrimitiveFieldValue> = TValue extends string
  ? BaseTypes.TextFormField | MultilingualOptionsFormField<TValue> | BaseTypes.DateFormField
  : TValue extends number
  ? BaseTypes.NumericFormField
  : TValue extends boolean
  ? BaseTypes.BinaryFormField
  : never;

type MultilingualArrayFieldset<T extends BaseTypes.ArrayFieldValue[number]> = {
  [K in keyof T]:
    | MultilingualPrimitiveFormField<T[K]>
    | ((fieldset: Nullable<T>) => MultilingualPrimitiveFormField<T[K]> | null);
};

type MultilingualArrayFormField<TValue extends BaseTypes.ArrayFieldValue> = BaseTypes.FormFieldMixin<{
  kind: 'array';
  fieldset: MultilingualArrayFieldset<TValue[number]>;
}>;

type MultilingualFormField<TValue> = [TValue] extends [BaseTypes.PrimitiveFieldValue]
  ? MultilingualPrimitiveFormField<TValue>
  : [TValue] extends [BaseTypes.ArrayFieldValue]
  ? MultilingualArrayFormField<TValue>
  : never;

type MultilingualFormFields<TData extends BaseTypes.FormInstrumentData> = {
  [K in keyof TData]: MultilingualFormField<TData[K]>;
};

type MultilingualFormFieldsGroup<TData extends BaseTypes.FormInstrumentData> = {
  title: { [L in Language]: string };
  fields: {
    [K in keyof TData]?: MultilingualFormField<TData[K]>;
  };
};

type MultilingualFormContent<TData extends BaseTypes.FormInstrumentData> =
  | MultilingualFormFields<TData>
  | MultilingualFormFieldsGroup<TData>[];

export type MultilingualForm<TData extends BaseTypes.FormInstrumentData> = Simplify<
  Omit<FormInstrument<TData>, 'details' | 'content'> & {
    details: MultilingualFormDetails;
    content: MultilingualFormContent<TData>;
  }
>;
