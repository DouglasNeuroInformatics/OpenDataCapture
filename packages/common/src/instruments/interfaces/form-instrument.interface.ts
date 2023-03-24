import { FormDetails } from './form-details.interface';
import { FormField } from './form-field.interface';
import { JSONInstrument } from './json-instrument.interface';

export interface FormInstrument<TData extends Record<string, any>> extends JSONInstrument<FormField[], TData> {
  details: FormDetails;
}
