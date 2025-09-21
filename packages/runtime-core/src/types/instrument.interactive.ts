/* eslint-disable @typescript-eslint/no-namespace */

import type { Merge, Promisable } from 'type-fest';

import type { Json, Language } from './core.js';
import type { InstrumentLanguage, ScalarInstrument } from './instrument.base.js';

/** @public */
declare namespace InteractiveInstrument {
  export type Data = Json;
}

/** @public */
declare type InteractiveInstrument<
  TData extends InteractiveInstrument.Data = InteractiveInstrument.Data,
  TLanguage extends InstrumentLanguage = InstrumentLanguage
> = Merge<
  ScalarInstrument<TData, TLanguage>,
  {
    content: {
      /** attributes to inject in the iframe head */
      readonly __injectHead?: {
        /** an array of base64 encoded legacy scripts */
        readonly scripts?: readonly string[];
        /** base64 encoded css */
        readonly style?: string;
      };
      html?: string;
      meta?: {
        [name: string]: string;
      };
      render: (done: (data: TData) => void) => Promisable<void>;
      staticAssets?: {
        [key: string]: string;
      };
    };
    kind: 'INTERACTIVE';
  }
>;

/** @internal */
type AnyUnilingualInteractiveInstrument = InteractiveInstrument<InteractiveInstrument.Data, Language>;

/** @internal */
type AnyMultilingualInteractiveInstrument = InteractiveInstrument<InteractiveInstrument.Data, Language[]>;

export type { AnyMultilingualInteractiveInstrument, AnyUnilingualInteractiveInstrument, InteractiveInstrument };
