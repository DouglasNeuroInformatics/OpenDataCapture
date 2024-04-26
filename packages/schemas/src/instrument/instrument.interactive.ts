/// <reference lib="dom" />
/// <reference lib="dom.iterable" />

import type { Exact, Merge } from 'type-fest';
import { z } from 'zod';

import { $UnilingualBaseInstrument, $UnilingualEnhancedBaseInstrumentDetails } from './instrument.base.js';

import type { Json, Language } from '../core/core.js';
import type { BaseInstrument, EnhancedBaseInstrumentDetails } from './instrument.base.js';

type InteractiveInstrumentContent<TData extends Json = Json> = {
  /** attributes to inject in the iframe head */
  readonly __injectHead?: {
    /** base64 encoded css */
    readonly style: string;
  };
  render: (done: <T extends Exact<TData, T>>(data: T) => void) => any;
};

export type InteractiveInstrument<TData extends Json = Json> = Merge<
  BaseInstrument<TData, Language>,
  {
    content: InteractiveInstrumentContent<TData>;
    details: EnhancedBaseInstrumentDetails<Language>;
    kind: 'INTERACTIVE';
  }
>;
export const $InteractiveInstrument: z.ZodType<InteractiveInstrument> = $UnilingualBaseInstrument.extend({
  content: z.object({
    __injectHead: z
      .object({
        style: z.string().readonly()
      })
      .optional()
      .readonly(),
    render: z.function().args(z.any()).returns(z.any())
  }),
  details: $UnilingualEnhancedBaseInstrumentDetails,
  kind: z.literal('INTERACTIVE')
});
