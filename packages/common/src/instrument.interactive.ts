import type { Merge } from 'type-fest';
import { z } from 'zod';

import { type Json, type Language } from './core';
import {
  $BaseInstrument,
  $EnhancedBaseInstrumentDetails,
  type BaseInstrument,
  type BaseInstrumentSummary,
  type EnhancedBaseInstrumentDetails
} from './instrument.base';

export type InteractiveInstrument<TData extends Json = Json, TLanguage extends Language = Language> = Merge<
  BaseInstrument<TData, Language>,
  {
    content: {
      render: (this: Window, ...args: any[]) => any;
    };
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
