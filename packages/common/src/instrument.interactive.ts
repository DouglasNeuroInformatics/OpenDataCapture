import type { Merge } from 'type-fest';
import { z } from 'zod';

import { type Json, type Language } from './core';
import {
  $BaseInstrument,
  $EnhancedBaseInstrumentDetails,
  type BaseInstrument,
  type EnhancedBaseInstrumentDetails
} from './instrument.base';

export type InteractiveInstrument<TData extends Json = Json, TLanguage extends Language = Language> = Merge<
  BaseInstrument<TData, Language>,
  {
    content: {
      render: (done: (data: TData) => void) => any;
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
