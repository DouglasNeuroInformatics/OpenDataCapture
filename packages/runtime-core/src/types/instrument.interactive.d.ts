import type { Exact, Merge, Promisable, SetRequired } from 'type-fest';

import type { Json, Language } from './core.d.ts';
import type { InstrumentDetails, InstrumentLanguage, ScalarInstrument } from './instrument.base.d.ts';

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
        /** base64 encoded css */
        readonly style: string;
      };
      render: (done: <T extends Exact<TData, T>>(data: T) => void) => Promisable<void>;
    };
    details: SetRequired<InstrumentDetails<TLanguage>, 'estimatedDuration' | 'instructions'>;
    kind: 'INTERACTIVE';
  }
>;

/** @internal */
type AnyUnilingualInteractiveInstrument = InteractiveInstrument<InteractiveInstrument.Data, Language>;

/** @internal */
type AnyMultilingualInteractiveInstrument = InteractiveInstrument<InteractiveInstrument.Data, Language[]>;

export type { AnyMultilingualInteractiveInstrument, AnyUnilingualInteractiveInstrument, InteractiveInstrument };
