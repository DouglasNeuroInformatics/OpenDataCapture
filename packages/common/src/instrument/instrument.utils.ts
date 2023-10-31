import { z } from 'zod';

import type { BaseInstrument } from './instrument.types';

export type InstrumentContext = {
  z: typeof z;
};

export type InstrumentFactory<T extends BaseInstrument> = (ctx: InstrumentContext) => Omit<T, 'source'>;

type DefineInstrumentOptions<T extends BaseInstrument> = {
  factory: InstrumentFactory<T>;
};

export function defineInstrument<T extends BaseInstrument>({ factory }: DefineInstrumentOptions<T>) {
  const transpiler = new Bun.Transpiler({ deadCodeElimination: false, minifyWhitespace: true, target: 'browser' });
  const instrument = factory({ z }) as T;
  instrument.source = transpiler.transformSync(factory.toString());
  return instrument;
}

export function evaluateInstrument<T extends BaseInstrument>(source: string) {
  const factory = (0, eval)(`"use strict"; ${source}`) as InstrumentFactory<T>;
  const instrument = factory({ z }) as T;
  instrument.source = source;
  return instrument;
}
