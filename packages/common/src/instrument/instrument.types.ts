import type { FormInstrument } from './types/form-instrument.types';
import type { InteractiveInstrument } from './types/interactive-instrument.types';

export type InstrumentBundle = {
  bundle: string;
};

export type InstrumentSource = {
  source: string;
};

export type Instrument = FormInstrument | InteractiveInstrument;

export * from './types/base-instrument.types';
export * from './types/form-instrument.types';
export * from './types/interactive-instrument.types';
