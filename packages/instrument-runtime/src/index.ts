import { type Instrument, formInstrumentSchema } from '@open-data-capture/common/instrument';
import { z } from 'zod';

type InstrumentContext = {
  z: typeof z;
};

type InstrumentFactory<T extends Instrument> = (ctx: InstrumentContext) => T;

function validateInstrument<T extends Instrument>(instrument: T) {
  switch (instrument.kind) {
    case 'form':
      return formInstrumentSchema.parse(instrument) as T;
    default:
      throw new Error('Unexpected instrument type: ' + instrument.kind);
  }
}

type EvaluateInstrumentOptions = {
  /** Whether to validate the structure of the instrument at runtime (expensive) */
  validate?: boolean;
};

export function evaluateInstrument<T extends Instrument = Instrument>(
  bundle: string,
  { validate }: EvaluateInstrumentOptions = { validate: false }
) {
  const factory = (0, eval)(`"use strict"; ${bundle}`) as InstrumentFactory<T>;
  const result = factory({ z });
  if (validate) {
    return validateInstrument(result);
  }
  return result;
}
