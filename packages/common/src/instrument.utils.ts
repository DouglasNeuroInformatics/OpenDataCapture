/* eslint-disable @typescript-eslint/no-implied-eval */

import { InstrumentKind } from '@open-data-capture/database/core';

import { $FormInstrument, $InteractiveInstrument, type Instrument } from './instrument';

type EvaluateInstrumentOptions<T extends InstrumentKind> = {
  /** The kind of instrument being evaluated. If validate is set to true, this will be enforced at runtime. Otherwise, it will just be asserted */
  kind?: T;
  /** Whether to validate the structure of the instrument at runtime (expensive) */
  validate?: boolean;
};

export async function evaluateInstrument<TKind extends InstrumentKind>(
  bundle: string,
  { kind, validate }: EvaluateInstrumentOptions<TKind> = { validate: false }
) {
  let instrument: Extract<Instrument, { kind: TKind }>;
  try {
    const factory = new Function(`return ${bundle}`);
    const value = (await factory()) as unknown;
    if (!validate) {
      instrument = value as Extract<Instrument, { kind: TKind }>;
    } else if (kind === 'FORM') {
      instrument = (await $FormInstrument.parseAsync(value)) as Extract<Instrument, { kind: TKind }>;
    } else if (kind === 'INTERACTIVE') {
      instrument = (await $InteractiveInstrument.parseAsync(value)) as Extract<Instrument, { kind: TKind }>;
    } else {
      throw new Error(`Unexpected kind: ${kind}`);
    }
  } catch (error) {
    throw new Error(`Failed to evaluate instrument bundle`, { cause: { bundle, error } });
  }
  return instrument;
}
