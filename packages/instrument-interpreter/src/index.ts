/* eslint-disable @typescript-eslint/no-implied-eval */

import { evaluateInstrument } from '@opendatacapture/evaluate-instrument';
import { $AnyInstrument, $FormInstrument, $InteractiveInstrument } from '@opendatacapture/schemas/instrument';
import type { AnyInstrument, InstrumentKind } from '@opendatacapture/schemas/instrument';
import type { Promisable } from 'type-fest';
export type InstrumentInterpreterOptions = {
  /** An optional function to preprocess a bundle */
  transformBundle?: ((bundle: string) => Promisable<string>) | null;
};

export type InterpretOptions<TKind extends InstrumentKind> = {
  /** The value to assign to the id property of the instrument */
  id?: string;
  /** The kind of instrument being evaluated. If validate is set to true, this will be enforced at runtime. Otherwise, it will just be asserted */
  kind?: TKind;
  /** Whether to validate the structure of the instrument at runtime (expensive) */
  validate?: boolean;
};

export class InstrumentInterpreter {
  private transformBundle?: ((bundle: string) => Promisable<string>) | null;

  constructor(options?: InstrumentInterpreterOptions) {
    this.transformBundle = options?.transformBundle;
  }

  async interpret<TKind extends InstrumentKind>(
    bundle: string,
    options?: InterpretOptions<TKind>
  ): Promise<Extract<AnyInstrument, { kind: TKind }>> {
    let instrument: AnyInstrument;
    try {
      bundle = (await this.transformBundle?.(bundle)) ?? bundle;
      const value = await evaluateInstrument(bundle);
      if (!options?.validate) {
        instrument = value as Extract<AnyInstrument, { kind: TKind }>;
      } else if (options.kind === 'FORM') {
        instrument = await $FormInstrument.parseAsync(value);
      } else if (options.kind === 'INTERACTIVE') {
        instrument = await $InteractiveInstrument.parseAsync(value);
      } else if (options.kind === undefined) {
        instrument = await $AnyInstrument.parseAsync(value);
      } else {
        throw new Error(`Unexpected kind: ${options.kind}`);
      }
    } catch (error) {
      throw new Error(`Failed to evaluate instrument bundle`, { cause: error });
    }
    instrument.id = options?.id;
    return instrument as Extract<AnyInstrument, { kind: TKind }>;
  }
}
