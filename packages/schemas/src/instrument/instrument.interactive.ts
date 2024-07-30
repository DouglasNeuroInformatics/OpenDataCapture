/// <reference lib="dom" />
/// <reference lib="dom.iterable" />

import type { Exact, Merge, Promisable, SetRequired } from 'type-fest';
import { z } from 'zod';

import { $UnilingualInstrumentDetails, $UnilingualScalarInstrument } from './instrument.base.js';

import type { Json, Language } from '../core/core.js';
import type { ScalarInstrument, UnilingualInstrumentDetails } from './instrument.base.js';

export type InteractiveInstrument<TData extends Json = Json> = Merge<
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
    details: SetRequired<UnilingualInstrumentDetails, 'estimatedDuration' | 'instructions'>;
    kind: 'INTERACTIVE';
  }
>;
export const $InteractiveInstrument: z.ZodType<InteractiveInstrument> = $UnilingualScalarInstrument.extend({
  content: z.object({
    __injectHead: z
      .object({
        style: z.string().readonly()
      })
      .optional()
      .readonly(),
    render: z.function().args(z.any()).returns(z.any())
  }),
  details: $UnilingualInstrumentDetails.required({
    estimatedDuration: true,
    instructions: true
  }),
  kind: z.literal('INTERACTIVE')
});
