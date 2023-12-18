import type { Promisable } from 'type-fest';

import {
  $FormInstrument,
  $InteractiveInstrument,
  type FormInstrument,
  type Instrument,
  type InteractiveInstrument
} from './instrument';

type InstrumentFactory<T extends Instrument> = () => Promisable<T>;

function validateInstrument<T extends Instrument>(instrument: T) {
  switch (instrument.kind) {
    case 'form':
      return $FormInstrument.parse(instrument) satisfies FormInstrument;
    case 'interactive':
      return $InteractiveInstrument.parse(instrument) satisfies InteractiveInstrument;
    default:
      throw new Error(`Unexpected instrument type: ${(instrument as Record<string, any>).kind}`);
  }
}

type EvaluateInstrumentOptions = {
  /** Whether to validate the structure of the instrument at runtime (expensive) */
  validate?: boolean;
};

export async function evaluateInstrument<T extends Instrument = Instrument>(
  bundle: string,
  { validate }: EvaluateInstrumentOptions = { validate: false }
) {
  const factory = (0, eval)(`"use strict"; ${bundle}`) as InstrumentFactory<T>;
  const result = await factory();
  if (validate) {
    return validateInstrument(result);
  }
  return result;
}
