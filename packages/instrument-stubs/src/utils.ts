import { deepFreeze } from '@douglasneuroinformatics/libjs';
import { InstrumentTransformer } from '@opendatacapture/instrument-transformer';
import type { Json } from '@opendatacapture/schemas/core';
import type {
  FormDataType,
  FormInstrument,
  InstrumentLanguage,
  InteractiveInstrument
} from '@opendatacapture/schemas/instrument';

type InstrumentStubInstance<T> =
  T extends FormInstrument<infer TData extends FormDataType, infer TLanguage extends InstrumentLanguage>
    ? FormInstrument<TData, TLanguage>
    : T extends InteractiveInstrument<infer TData extends Json>
      ? InteractiveInstrument<TData>
      : never;

export class InstrumentStub<T> {
  instance: InstrumentStubInstance<T>;
  source: string;

  #transformer = new InstrumentTransformer();

  constructor(options: { factory: () => InstrumentStubInstance<T> }) {
    this.instance = deepFreeze(options.factory()) as InstrumentStubInstance<T>;
    this.source = `export default (${options.factory.toString()})()`;
  }

  async toBundle() {
    return this.#transformer.generateBundle(this.source);
  }
}
