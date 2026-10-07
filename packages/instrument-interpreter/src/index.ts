import type { AnyInstrument } from '@opendatacapture/runtime-core';
import { evaluateInstrument } from '@opendatacapture/runtime-internal';
import { $AnyInstrument } from '@opendatacapture/schemas/instrument';

import { findReactImport } from './imports.js';

export type InterpretOptions = {
  /** The value to assign to the id property of the instrument */
  id?: string;
  /** Whether to validate the structure of the instrument at runtime (expensive) */
  validate?: boolean;
};

export class InstrumentInterpreter {
  async interpret(bundle: string, options?: InterpretOptions): Promise<AnyInstrument> {
    let instrument: AnyInstrument;
    let value: unknown;
    try {
      value = await evaluateInstrument(bundle);
      instrument = options?.validate ? await $AnyInstrument.parseAsync(value) : (value as AnyInstrument);
    } catch (error) {
      if (value) {
        console.error({
          message: 'Validation Error',
          value
        });
      }
      throw new Error(`Failed to evaluate instrument bundle`, { cause: error });
    }
    if (instrument.kind !== 'INTERACTIVE') {
      const reactImport = findReactImport(bundle);
      if (reactImport) {
        throw new Error(
          `Cannot import '${reactImport}' in an instrument of kind '${instrument.kind}': React is available only to interactive instruments, which render in a document of their own. A form block receives everything it needs as the second argument to its render function.`
        );
      }
    }
    instrument.id = options?.id;
    return instrument;
  }
}
