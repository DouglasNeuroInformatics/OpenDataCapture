import type { Merge } from 'type-fest';

import type { Language } from './core.d.ts';
import type { BaseInstrument, InstrumentLanguage, ScalarInstrumentInternal } from './instrument.base.d.ts';

/** @public */
type SeriesInstrument<TLanguage extends InstrumentLanguage = InstrumentLanguage> = Merge<
  BaseInstrument<TLanguage>,
  {
    content: ScalarInstrumentInternal[];
    kind: 'SERIES';
  }
>;

/** @public */
type UnilingualSeriesInstrument = SeriesInstrument<Language>;

/** @public */
type MultilingualSeriesInstrument = SeriesInstrument<Language[]>;

export type { MultilingualSeriesInstrument, SeriesInstrument, UnilingualSeriesInstrument };
