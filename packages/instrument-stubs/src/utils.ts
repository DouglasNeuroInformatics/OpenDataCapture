import { deepFreeze, randomInt } from '@douglasneuroinformatics/libjs';
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

type InstrumentStub<T> = {
  bundle: string;
  instance: InstrumentStubInstance<T> & { id: string };
  source: string;
};

const transformer = new InstrumentTransformer();

export async function createInstrumentStub<T>(
  factory: () => Promise<InstrumentStubInstance<T>>
): Promise<InstrumentStub<T>> {
  const source = `export default (${factory.toString()})()`;
  return {
    bundle: await transformer.generateBundle(source),
    instance: deepFreeze({
      ...(await factory()),
      id: randomInt(100, 999).toString()
    }) as InstrumentStubInstance<T> & { id: string },
    source
  };
}
