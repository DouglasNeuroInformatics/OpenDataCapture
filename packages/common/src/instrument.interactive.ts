/// <reference lib="dom" />
/// <reference lib="dom.iterable" />

import type { Merge } from 'type-fest';
import { z } from 'zod';

import { $BaseInstrument, $EnhancedBaseInstrumentDetails } from './instrument.base';

import type { Json, Language } from './core';
import type { BaseInstrument, BaseInstrumentSummary, EnhancedBaseInstrumentDetails } from './instrument.base';

export type InteractiveInstrumentContent = {
  assets?: {
    css?: Record<string, string>;
    img?: Record<string, string>;
  };
  render: (...args: any[]) => any;
};

export type InteractiveInstrument<TData extends Json = Json, TLanguage extends Language = Language> = Merge<
  BaseInstrument<TData, Language>,
  {
    content: InteractiveInstrumentContent;
    details: EnhancedBaseInstrumentDetails<TLanguage>;
    kind: 'INTERACTIVE';
  }
>;

export const $InteractiveInstrument = $BaseInstrument('en').extend({
  content: z.object({
    render: z.function().args(z.any()).returns(z.any())
  }),
  details: $EnhancedBaseInstrumentDetails('en'),
  kind: z.literal('INTERACTIVE')
});

export type InteractiveInstrumentSummary<
  TData extends Json = Json,
  TLanguage extends Language = Language
> = BaseInstrumentSummary<InteractiveInstrument<TData, TLanguage>>;
