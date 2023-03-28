import { FormInstrument } from './form-instrument.interface';

export interface FormSummary extends Omit<FormInstrument, 'content' | 'validationSchema'> {
  _id: string;
}
