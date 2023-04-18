import { Language } from '@ddcp/common/core';
import {
  ArrayFieldValue,
  FormDetails,
  FormField,
  FormInstrumentData,
  PrimitiveFieldValue
} from '@ddcp/common/instruments';
import { JSONSchemaType } from 'ajv';
import { Simplify } from 'type-fest';

export type MultilingualFormDetails = Simplify<
  Pick<FormDetails, 'estimatedDuration'> & {
    [K in keyof Pick<FormDetails, 'description' | 'instructions' | 'title'>]: {
      [L in Language]: FormDetails[K];
    };
  }
>;

export type MultilingualFormField<TValue extends PrimitiveFieldValue | ArrayFieldValue> = Simplify<
  Omit<FormField<TValue>, 'label' | 'description'> & {
    label: { [L in Language]: string };
    description?: { [L in Language]: string };
  }
>;

export type MultilingualFormFields<TData extends FormInstrumentData> = {
  [K in keyof TData]: MultilingualFormField<TData[K]>;
};

export type MultilingualFormContent<TData extends FormInstrumentData> = MultilingualFormFields<TData>;

export type MultilingualFormDefinition<TData extends FormInstrumentData> = {
  name: string;
  tags: string[];
  version: number;
  details: MultilingualFormDetails;
  content: MultilingualFormContent<TData>;
  validationSchema: JSONSchemaType<TData>;
};
