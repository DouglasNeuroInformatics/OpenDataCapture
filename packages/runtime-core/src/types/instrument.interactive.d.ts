import type { Exact, Merge, Promisable, SetRequired } from 'type-fest';

import type { Json, Language } from './core.d.ts';
import type { InstrumentDetails, ScalarInstrument } from './instrument.base.d.ts';

/** @public */
type InteractiveInstrument<TData extends Json = Json> = Merge<
  ScalarInstrument<TData, Language>,
  {
    content: {
      /** attributes to inject in the iframe head */
      readonly __injectHead?: {
        /** base64 encoded css */
        readonly style: string;
      };
      render: (done: <T extends Exact<TData, T>>(data: T) => void) => Promisable<void>;
    };
    details: SetRequired<InstrumentDetails<Language>, 'estimatedDuration' | 'instructions'>;
    kind: 'INTERACTIVE';
  }
>;

export type { InteractiveInstrument };
