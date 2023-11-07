import { z } from 'zod';

import type { BaseInstrument, InstrumentFactory } from './instrument.types';

export function evaluateInstrument<T extends BaseInstrument>(bundle: string) {
  const factory = (0, eval)(`"use strict"; ${bundle}`) as InstrumentFactory<T>;
  return factory({ z });
}
