/* eslint-disable @typescript-eslint/no-implied-eval */

import { $FormInstrument, $Instrument, $InteractiveInstrument, type Instrument } from './instrument';

import type { InstrumentKind } from './instrument.base';

export type EvaluateInstrumentOptions<TKind extends InstrumentKind> = {
  /** The value to assign to the id property of the instrument */
  id?: string;
  /** The kind of instrument being evaluated. If validate is set to true, this will be enforced at runtime. Otherwise, it will just be asserted */
  kind?: TKind;
  /** Whether to validate the structure of the instrument at runtime (expensive) */
  validate?: boolean;
};

export async function evaluateInstrument<TKind extends InstrumentKind>(
  bundle: string,
  { id, kind, validate }: EvaluateInstrumentOptions<TKind> = { validate: false }
) {
  let instrument: Instrument;
  try {
    const factory = new Function(`return ${bundle}`);
    const value = (await factory()) as unknown;
    if (!validate) {
      instrument = value as Extract<Instrument, { kind: TKind }>;
    } else if (kind === 'FORM') {
      instrument = await $FormInstrument.parseAsync(value);
    } else if (kind === 'INTERACTIVE') {
      instrument = await $InteractiveInstrument.parseAsync(value);
    } else if (kind === undefined) {
      instrument = await $Instrument.parseAsync(value);
    } else {
      throw new Error(`Unexpected kind: ${kind}`);
    }
  } catch (error) {
    throw new Error(`Failed to evaluate instrument bundle`, { cause: { bundle, error } });
  }
  instrument.id = id;
  return instrument as Extract<Instrument, { kind: TKind }>;
}
