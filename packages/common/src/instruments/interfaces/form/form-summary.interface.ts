import { FormInstrument } from './form-instrument.interface';

export interface FormSummary extends Omit<FormInstrument, 'content' | 'details' | 'validationSchema'> {
  _id: string;
}
