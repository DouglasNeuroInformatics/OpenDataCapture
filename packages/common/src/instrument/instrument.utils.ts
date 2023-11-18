import { z } from 'zod';

import type { BaseInstrument } from './instrument.types';

type InstrumentContext = {
  z: typeof z;
};

type InstrumentFactory<T extends BaseInstrument = BaseInstrument> = (ctx: InstrumentContext) => T;

export function evaluateInstrument<T extends BaseInstrument>(bundle: string) {
  const factory = (0, eval)(`"use strict"; ${bundle}`) as InstrumentFactory<T>;
  return factory({ z });
}
