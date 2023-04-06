import { FormInstrument } from './form-instrument.interface';

export interface FormInstrumentSummary extends Omit<FormInstrument, 'content' | 'validationSchema'> {
  _id: string;
}
