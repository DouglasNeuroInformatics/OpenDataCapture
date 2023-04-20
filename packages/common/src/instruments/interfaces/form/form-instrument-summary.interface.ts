import { FormInstrument } from './form-instrument.types';

export interface FormInstrumentSummary extends Omit<FormInstrument, 'content' | 'validationSchema'> {
  _id: string;
}
