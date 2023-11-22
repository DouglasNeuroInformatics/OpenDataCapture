import { z } from 'zod';

import { baseInstrumentSchema } from './base-instrument.schemas';

export const interactiveInstrumentSchema = baseInstrumentSchema.extend({
  content: z.object({
    render: z.function()
  }),
  kind: z.literal('interactive')
});

export type InteractiveInstrument = z.infer<typeof interactiveInstrumentSchema>;
