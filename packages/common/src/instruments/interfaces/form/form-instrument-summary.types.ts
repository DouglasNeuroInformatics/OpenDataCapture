import { Simplify } from 'type-fest';

import { FormInstrument } from './form-instrument.types';

export type FormInstrumentSummary = Simplify<
  Omit<FormInstrument, 'content' | 'validationSchema'> & {
    identifier: string;
  }
>;
