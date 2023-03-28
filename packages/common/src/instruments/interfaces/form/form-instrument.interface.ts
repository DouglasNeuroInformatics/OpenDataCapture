import { JSONSchemaType } from 'ajv';

import { BaseInstrument } from '../base/base-instrument.interface';

import { FormDetails } from './form-details.interface';
import { FormField, FormFieldType } from './form-field.interface';

export interface FormInstrumentData {
  [key: string]: FormFieldType;
}

export interface FormInstrument<TData extends FormInstrumentData = FormInstrumentData> extends BaseInstrument {
  content: {
    [FieldName in keyof TData]: FormField;
  };
  details: FormDetails;
  validationSchema: JSONSchemaType<TData>;
}
