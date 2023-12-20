import type React from 'react';

import type { Merge } from 'type-fest';
import { z } from 'zod';

import { $Json, type Json } from './core';
import {
  $BaseInstrument,
  $EnhancedBaseInstrumentDetails,
  type BaseInstrument,
  type EnhancedBaseInstrumentDetails,
  type InstrumentLanguage
} from './instrument.base';

export type InteractiveInstrument<
  TData extends Json = Json,
  TLanguage extends InstrumentLanguage = InstrumentLanguage
> = Merge<
  BaseInstrument<TData>,
  {
    content: {
      render: (done: (data: TData) => void) => React.ReactNode;
    };
    details: EnhancedBaseInstrumentDetails<TLanguage>;
    kind: 'interactive';
  }
>;

export const $InteractiveInstrument = $BaseInstrument.extend({
  content: z.object({
    render: z.function().args(z.any()).returns(z.any())
  }),
  data: $Json,
  details: $EnhancedBaseInstrumentDetails,
  kind: z.literal('interactive'),
  validationSchema: z.instanceof(z.ZodType<Json>)
}) satisfies Zod.ZodType<InteractiveInstrument>;

export type InteractiveInstrumentDef<TData, TLanguage extends InstrumentLanguage> = TData extends Json
  ? InteractiveInstrument<TData, TLanguage>
  : never;
