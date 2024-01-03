import {
  $FormInstrument,
  $InteractiveInstrument,
  type BaseInstrument,
  type FormInstrument,
  type Instrument,
  type InteractiveInstrument
} from './instrument';

type InstrumentFactory<T extends Instrument> = () => Promise<T>;

function validateInstrument(instrument: BaseInstrument) {
  switch (instrument.kind) {
    case 'form':
      return $FormInstrument.parse(instrument) as FormInstrument;
    case 'interactive':
      return $InteractiveInstrument.parse(instrument) as InteractiveInstrument;
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
): Promise<T> {
  const factory = (0, eval)(`"use strict"; ${bundle}`) as InstrumentFactory<T>;
  const result = await factory();
  if (validate) {
    return validateInstrument(result) as T;
  }
  return result;
}
