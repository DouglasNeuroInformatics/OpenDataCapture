/* eslint-disable @typescript-eslint/no-implied-eval */

import { $FormInstrument, $Instrument, $InteractiveInstrument } from '@open-data-capture/common/instrument';
import type { Instrument, InstrumentKind } from '@open-data-capture/common/instrument';

export type InstrumentInterpreterOptions<TKind extends InstrumentKind> = {
  /** The kind of instrument being evaluated. If validate is set to true, this will be enforced at runtime. Otherwise, it will just be asserted */
  kind?: TKind;
  /** Whether to validate the structure of the instrument at runtime (expensive) */
  validate?: boolean;
};

export type InterpretOptions = {
  /** The value to assign to the id property of the instrument */
  id?: string;
};

export class InstrumentInterpreter<TKind extends InstrumentKind> {
  private kind?: TKind;
  private validate?: boolean;

  constructor(options?: InstrumentInterpreterOptions<TKind>) {
    this.kind = options?.kind;
    this.validate = options?.validate;
  }

  async interpret(bundle: string, options?: InterpretOptions) {
    let instrument: Instrument;
    try {
      const factory = new Function(`return ${bundle}`);
      const value = (await factory()) as unknown;
      if (!this.validate) {
        instrument = value as Extract<Instrument, { kind: TKind }>;
      } else if (this.kind === 'FORM') {
        instrument = await $FormInstrument.parseAsync(value);
      } else if (this.kind === 'INTERACTIVE') {
        instrument = await $InteractiveInstrument.parseAsync(value);
      } else if (this.kind === undefined) {
        instrument = await $Instrument.parseAsync(value);
      } else {
        throw new Error(`Unexpected kind: ${this.kind}`);
      }
    } catch (error) {
      throw new Error(`Failed to evaluate instrument bundle`, { cause: { bundle, error } });
    }
    instrument.id = options?.id;
    return instrument as Extract<Instrument, { kind: TKind }>;
  }
}
