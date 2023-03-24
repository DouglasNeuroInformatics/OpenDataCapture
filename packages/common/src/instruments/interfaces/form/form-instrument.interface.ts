import { JSONInstrument } from '../generic/json-instrument.interface';

import { FormDetails } from './form-details.interface';
import { FormField } from './form-field.interface';

export interface FormInstrument<TData> extends JSONInstrument<FormField[], TData> {
  details: FormDetails;
}
