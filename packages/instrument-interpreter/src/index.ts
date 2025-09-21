import type { AnyInstrument, InstrumentKind, SomeInstrument } from '@opendatacapture/runtime-core';
import { evaluateInstrument } from '@opendatacapture/runtime-internal';
import {
  $AnyInstrument,
  $FormInstrument,
  $InteractiveInstrument,
  $SeriesInstrument
} from '@opendatacapture/schemas/instrument';
import type { Promisable } from 'type-fest';

export type InstrumentInterpreterOptions = {
  /** An optional function to preprocess a bundle */
  transformBundle?: ((bundle: string) => Promisable<string>) | null;
};

export type InterpretOptions<TKind extends InstrumentKind = InstrumentKind> = {
  /** The value to assign to the id property of the instrument */
  id?: string;
  /** The kind of instrument being evaluated. If validate is set to true, this will be enforced at runtime. Otherwise, it will just be asserted */
  kind?: TKind;
  /** Whether to validate the structure of the instrument at runtime (expensive) */
  validate?: boolean;
};

export class InstrumentInterpreter {
  async interpret<TKind extends InstrumentKind>(
    bundle: string,
    options?: InterpretOptions<TKind>
  ): Promise<SomeInstrument<TKind>> {
    let instrument: AnyInstrument;
    let value: unknown;
    try {
      value = await evaluateInstrument(bundle);
      if (!options?.validate) {
        instrument = value as SomeInstrument<TKind>;
      } else if (options.kind === 'FORM') {
        instrument = await $FormInstrument.parseAsync(value);
      } else if (options.kind === 'INTERACTIVE') {
        instrument = await $InteractiveInstrument.parseAsync(value);
      } else if (options.kind === 'SERIES') {
        instrument = await $SeriesInstrument.parseAsync(value);
      } else if (options.kind === undefined) {
        instrument = await $AnyInstrument.parseAsync(value);
      } else {
        throw new Error(`Unexpected kind: ${options.kind}`);
      }
    } catch (error) {
      if (value) {
        console.error({
          message: 'Validation Error',
          value
        });
      }
      throw new Error(`Failed to evaluate instrument bundle`, { cause: error });
    }
    instrument.id = options?.id;
    return instrument as SomeInstrument<TKind>;
  }
}
