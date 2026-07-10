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

  export type CompletionContext<TItemName extends string = string> = {
    /** The item after which the series ended (the terminating item, or the final item). */
    itemName?: TItemName;
    /** Whether the series ended early because `terminate` returned `true`. */
    terminated: boolean;
  };

  /** A localized message; keyed by language (e.g. `{ en, fr }`). */
  export type CompletionMessage = {
    [L in Language]?: string;
  };

  export type Params<TItemName extends string = string, TData = any> = {
    /**
     * Returns a custom localized `CompletionMessage` to show on the series completion screen, or
     * `null`/`undefined` to use the default. `context.terminated` indicates whether the series
     * ended early via `terminate`, allowing a distinct message per outcome.
     */
    completionMessage?: (this: void, context: CompletionContext<TItemName>) => CompletionMessage | null | undefined;
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
