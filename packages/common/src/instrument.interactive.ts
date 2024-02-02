/// <reference lib="dom" />
/// <reference lib="dom.iterable" />

import type { Merge } from 'type-fest';
import { z } from 'zod';

import { $BaseInstrument, $EnhancedBaseInstrumentDetails, $UnilingualInstrumentMeasures } from './instrument.base';

import type { Json, Language } from './core';
import type { BaseInstrument, EnhancedBaseInstrumentDetails } from './instrument.base';

export type InteractiveInstrumentContent<TData extends Json = Json> = {
  assets?: {
    css?: string[];
    img?: Record<string, string>;
  };
  render: (done: (data: TData) => void) => any;
};

export type InteractiveInstrument<TData extends Json = Json, TLanguage extends Language = Language> = Merge<
  BaseInstrument<TData, Language>,
  {
    content: InteractiveInstrumentContent<TData>;
    details: EnhancedBaseInstrumentDetails<TLanguage>;
    kind: 'INTERACTIVE';
  }
>;

export const $InteractiveInstrument = $BaseInstrument('en').extend({
  content: z.object({
    render: z.function().args(z.any()).returns(z.any())
  }),
  details: $EnhancedBaseInstrumentDetails('en'),
  kind: z.literal('INTERACTIVE'),
  measures: $UnilingualInstrumentMeasures.optional()
});
