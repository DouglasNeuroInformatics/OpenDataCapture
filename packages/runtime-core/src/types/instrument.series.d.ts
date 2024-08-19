import type { Merge } from 'type-fest';

import type { Language } from './core.d.ts';
import type { BaseInstrument, InstrumentLanguage, ScalarInstrumentInternal } from './instrument.base.d.ts';

/** @beta */
declare type SeriesInstrument<TLanguage extends InstrumentLanguage = InstrumentLanguage> = Merge<
  BaseInstrument<TLanguage>,
  {
    content: ScalarInstrumentInternal[];
    kind: 'SERIES';
  }
>;

/** @internal */
type UnilingualSeriesInstrument = SeriesInstrument<Language>;

/** @internal */
type MultilingualSeriesInstrument = SeriesInstrument<Language[]>;

export type { MultilingualSeriesInstrument, SeriesInstrument, UnilingualSeriesInstrument };
