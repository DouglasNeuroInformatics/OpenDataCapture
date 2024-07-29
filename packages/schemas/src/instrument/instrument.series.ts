import type { Merge } from 'type-fest';
import { z } from 'zod';

import {
  $ScalarInstrumentInternal,
  $UnilingualScalarInstrument,
  type BaseInstrument,
  type InstrumentLanguage,
  type ScalarInstrumentInternal
} from './instrument.base.js';

export type SeriesInstrument<TLanguage extends InstrumentLanguage = InstrumentLanguage> = Merge<
  BaseInstrument<TLanguage>,
  {
    content: ScalarInstrumentInternal[];
    kind: 'SERIES';
  }
>;

export const $SeriesInstrument: z.ZodType<SeriesInstrument> = $UnilingualScalarInstrument.extend({
  content: z.array($ScalarInstrumentInternal),
  kind: z.literal('SERIES')
});
