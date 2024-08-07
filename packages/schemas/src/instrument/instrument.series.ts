import type { Merge } from 'type-fest';
import { z } from 'zod';

import {
  $BaseInstrument,
  $ScalarInstrumentInternal,
  type BaseInstrument,
  type InstrumentLanguage,
  type ScalarInstrumentInternal
} from './instrument.base.js';

import type { Language } from '../core/core.js';

type SeriesInstrument<TLanguage extends InstrumentLanguage = InstrumentLanguage> = Merge<
  BaseInstrument<TLanguage>,
  {
    content: ScalarInstrumentInternal[];
    kind: 'SERIES';
  }
>;

type UnilingualSeriesInstrument = SeriesInstrument<Language>;
type MultilingualSeriesInstrument = SeriesInstrument<Language[]>;

const $SeriesInstrument: z.ZodType<SeriesInstrument> = $BaseInstrument.extend({
  content: z.array($ScalarInstrumentInternal),
  kind: z.literal('SERIES')
});

export { $SeriesInstrument };
export type { MultilingualSeriesInstrument, SeriesInstrument, UnilingualSeriesInstrument };
