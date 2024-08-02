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

export type SeriesInstrument<TLanguage extends InstrumentLanguage = InstrumentLanguage> = Merge<
  BaseInstrument<TLanguage>,
  {
    content: ScalarInstrumentInternal[];
    kind: 'SERIES';
  }
>;

export type UnilingualSeriesInstrument = SeriesInstrument<Language>;
export type MultilingualSeriesInstrument = SeriesInstrument<Language[]>;

export const $SeriesInstrument: z.ZodType<SeriesInstrument> = $BaseInstrument.extend({
  content: z.array($ScalarInstrumentInternal),
  kind: z.literal('SERIES')
});
