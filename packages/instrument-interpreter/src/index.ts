/* eslint-disable @typescript-eslint/no-implied-eval */

import { $FormInstrument, $Instrument, $InteractiveInstrument } from '@open-data-capture/common/instrument';
import type { Instrument, InstrumentKind } from '@open-data-capture/common/instrument';

export type InstrumentInterpreterOptions<TKind extends InstrumentKind> = {
  /** The value to assign to the id property of the instrument */
  id?: string;
  /** The kind of instrument being evaluated. If validate is set to true, this will be enforced at runtime. Otherwise, it will just be asserted */
  kind?: TKind;
  /** Whether to validate the structure of the instrument at runtime (expensive) */
  validate?: boolean;
};

export class InstrumentInterpreter {
  async interpret<TKind extends InstrumentKind>(bundle: string, options?: InstrumentInterpreterOptions<TKind>) {
    let instrument: Instrument;
    try {
      const factory = new Function(`return ${bundle}`);
      const value = (await factory()) as unknown;
      if (!options?.validate) {
        instrument = value as Extract<Instrument, { kind: TKind }>;
      } else if (options.kind === 'FORM') {
        instrument = await $FormInstrument.parseAsync(value);
      } else if (options.kind === 'INTERACTIVE') {
        instrument = await $InteractiveInstrument.parseAsync(value);
      } else if (options.kind === undefined) {
        instrument = await $Instrument.parseAsync(value);
      } else {
        throw new Error(`Unexpected kind: ${options.kind}`);
      }
    } catch (error) {
      throw new Error(`Failed to evaluate instrument bundle`, { cause: { bundle, error } });
    }
    instrument.id = options?.id;
    return instrument as Extract<Instrument, { kind: TKind }>;
  }
}
