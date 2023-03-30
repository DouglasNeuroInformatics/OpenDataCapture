import { JSONSchemaType } from 'ajv';

import { BaseInstrument } from '../base/base-instrument.interface';

import { FormDetails } from './form-details.interface';
import { FormFields, FormFieldsGroup, FormInstrumentData } from './form-fields.interface';

export interface FormInstrument<T extends FormInstrumentData = FormInstrumentData> extends BaseInstrument {
  content: FormFields<T> | FormFieldsGroup<T>[];
  details: FormDetails;
  validationSchema: JSONSchemaType<T>;
}
