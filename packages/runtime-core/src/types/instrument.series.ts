import type { Merge } from 'type-fest';

import type { Language } from './core.js';
import type { BaseInstrument, InstrumentLanguage, ScalarInstrumentInternal } from './instrument.base.js';

/** @beta */
declare type SeriesInstrument<TLanguage extends InstrumentLanguage = InstrumentLanguage> = Merge<
  BaseInstrument<TLanguage>,
  {
    content: ScalarInstrumentInternal[];
    internal?: never;
    kind: 'SERIES';
  }
>;

/** @internal */
type UnilingualSeriesInstrument = SeriesInstrument<Language>;

/** @internal */
type MultilingualSeriesInstrument = SeriesInstrument<Language[]>;

export type { MultilingualSeriesInstrument, SeriesInstrument, UnilingualSeriesInstrument };
