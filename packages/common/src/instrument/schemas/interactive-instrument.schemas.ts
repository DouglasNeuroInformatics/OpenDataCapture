import { z } from 'zod';

import { baseInstrumentSchema } from './base-instrument.schemas';
// import type { InteractiveInstrument } from '../types/interactive-instrument.types';

export const interactiveInstrumentSchema = baseInstrumentSchema.extend({
  content: z.object({
    render: z.function()
  }),
  kind: z.literal('interactive')
}); ///satisfies Zod.ZodType<InteractiveInstrument>;
