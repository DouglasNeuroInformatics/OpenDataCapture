import { FormDetails } from './form-details.interface';
import { FormField } from './form-field.interface';
import { JSONInstrument } from './json-instrument.interface';

export type FormInstrumentData = Record<string, any>;

export interface FormInstrument<TData extends FormInstrumentData = FormInstrumentData>
  extends JSONInstrument<FormField[], TData> {
  details: FormDetails;
}
