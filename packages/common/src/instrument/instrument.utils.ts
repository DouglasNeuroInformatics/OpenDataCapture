import { z } from 'zod';
import type Zod from 'zod';

import type { BaseInstrument } from './instrument.types';

export type InstrumentContext = {
  z: Omit<typeof Zod, 'z'>;
};

export type InstrumentFactory<T extends BaseInstrument> = (ctx: InstrumentContext) => T;

type DefineInstrumentOptions<T extends BaseInstrument> = {
  factory: InstrumentFactory<T>;
};

export function defineInstrument<T extends BaseInstrument>({ factory }: DefineInstrumentOptions<T>) {
  const transpiler = new Bun.Transpiler({ deadCodeElimination: false, minifyWhitespace: true, target: 'browser' });
  const instrument = factory({ z });
  instrument.source = transpiler.transformSync(factory.toString());
  return instrument;
}
