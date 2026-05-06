/* eslint-disable @typescript-eslint/no-namespace */

import type { Merge } from 'type-fest';

import type { Language } from './core.js';
import type { BaseInstrument, InstrumentLanguage, ScalarInstrumentInternal } from './instrument.base.js';

/** @public */
declare namespace SeriesInstrument {
  export type Params = {
    skipProgress?: boolean;
  };

  export type Content = ScalarInstrumentInternal[] | { items: ScalarInstrumentInternal[]; params?: Params };
}

/** @public */
declare type SeriesInstrument<TLanguage extends InstrumentLanguage = InstrumentLanguage> = Merge<
  BaseInstrument<TLanguage>,
  {
    content: SeriesInstrument.Content;
    internal?: never;
    kind: 'SERIES';
  }
>;

/** @internal */
type UnilingualSeriesInstrument = SeriesInstrument<Language>;

/** @internal */
type MultilingualSeriesInstrument = SeriesInstrument<Language[]>;

export type { MultilingualSeriesInstrument, SeriesInstrument, UnilingualSeriesInstrument };
