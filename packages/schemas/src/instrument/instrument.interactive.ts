/// <reference lib="dom" />
/// <reference lib="dom.iterable" />

import type { Exact, Merge } from 'type-fest';
import { z } from 'zod';

import { $UnilingualBaseInstrument, $UnilingualEnhancedBaseInstrumentDetails } from './instrument.base.js';

import type { Json, Language } from '../core/core.index.js';
import type { BaseInstrument, EnhancedBaseInstrumentDetails } from './instrument.base.js';

type InteractiveInstrumentContent<TData extends Json = Json> = {
  assets?: {
    css?: string[];
    img?: { [key: string]: string };
  };
  render: (done: <T extends Exact<TData, T>>(data: T) => void) => any;
};

export type InteractiveInstrument<TData extends Json = Json, TLanguage extends Language = Language> = Merge<
  BaseInstrument<TData, Language>,
  {
    content: InteractiveInstrumentContent<TData>;
    details: EnhancedBaseInstrumentDetails<TLanguage>;
    kind: 'INTERACTIVE';
  }
>;
export const $InteractiveInstrument: z.ZodType<InteractiveInstrument> = $UnilingualBaseInstrument.extend({
  content: z.object({
    render: z.function().args(z.any()).returns(z.any())
  }),
  details: $UnilingualEnhancedBaseInstrumentDetails,
  kind: z.literal('INTERACTIVE')
});
