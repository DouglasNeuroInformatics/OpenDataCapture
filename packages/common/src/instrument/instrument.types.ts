import type { InteractiveInstrument } from './instrument.schemas';
import type { FormInstrument } from './types/form-instrument.types';

export type InstrumentBundle = {
  bundle: string;
};

export type InstrumentSource = {
  source: string;
};

export type Instrument = FormInstrument | InteractiveInstrument;

export * from './types/base-instrument.types';
export * from './types/form-instrument.types';
