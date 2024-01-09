import type { Merge } from 'type-fest';
import { z } from 'zod';

import { type Json, type Language } from './core';
import { type BaseInstrument, type EnhancedBaseInstrumentDetails } from './instrument.base';

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

export const $InteractiveInstrument = z.any() as z.ZodType<InteractiveInstrument>;

// export const $InteractiveInstrument = $BaseInstrument.extend({
//   content: z.object({
//     render: z.function().args(z.any()).returns(z.any())
//   }),
//   details: $EnhancedBaseInstrumentDetails,
//   kind: z.literal('interactive'),
//   validationSchema: z.instanceof(z.ZodType<Json>)
// }) satisfies z.ZodType<InteractiveInstrument>;
