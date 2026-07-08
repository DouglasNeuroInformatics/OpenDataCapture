/* eslint-disable @typescript-eslint/no-namespace */

import type { Merge } from 'type-fest';

import type { Language } from './core.js';
import type { BaseInstrument, InstrumentLanguage, ScalarInstrumentInternal } from './instrument.base.js';

/** @public */
declare namespace SeriesInstrument {
  export type TerminateContext<TItemName extends string = string> = {
    itemIndex: number;
    itemName: TItemName;
  };

  export type Params<TItemName extends string = string, TData = any> = {
    skipProgress?: boolean;
    /**
     * Called after each item is submitted with that item's data and its `{ itemIndex, itemName }`.
     * Return `true` to end the series early. When authored via `defineSeriesInstrument`, `itemName`
     * is narrowed to the literal union of the series' item names. `data` defaults to `any`; annotate
     * the parameter (or pass `TData`) to type it as the terminating item's data shape.
     */
    terminate?: (this: void, data: TData, context: TerminateContext<TItemName>) => boolean;
  };

  export type Content<TItemName extends string = string, TData = any> =
    | ScalarInstrumentInternal[]
    | { items: ScalarInstrumentInternal[]; params?: Params<TItemName, TData> };
}

/** @public */
declare type SeriesInstrument<
  TLanguage extends InstrumentLanguage = InstrumentLanguage,
  TItemName extends string = string,
  TData = any
> = Merge<
  BaseInstrument<TLanguage>,
  {
    content: SeriesInstrument.Content<TItemName, TData>;
    internal?: never;
    kind: 'SERIES';
  }
>;

/** @internal */
type UnilingualSeriesInstrument = SeriesInstrument<Language>;

/** @internal */
type MultilingualSeriesInstrument = SeriesInstrument<Language[]>;

export type { MultilingualSeriesInstrument, SeriesInstrument, UnilingualSeriesInstrument };
