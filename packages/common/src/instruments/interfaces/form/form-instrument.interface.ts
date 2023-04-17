import { JSONSchemaType } from 'ajv';

import { BaseInstrument } from '../base/base-instrument.interface';

import { FormDetails } from './form-details.interface';
import { FormFields, FormFieldsGroup, FormInstrumentData } from './form-fields.interface';

export type FormInstrumentContent<T extends FormInstrumentData = FormInstrumentData> =
  | FormFields<T>
  | FormFieldsGroup<T>[];

export type FormInstrument<T extends FormInstrumentData = FormInstrumentData> = BaseInstrument<
  FormInstrumentContent<T>
> & {
  details: FormDetails;
  validationSchema: JSONSchemaType<T>;
};
