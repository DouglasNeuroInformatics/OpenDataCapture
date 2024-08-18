import type { InteractiveInstrument } from '@opendatacapture/runtime-core';
import { z } from 'zod';

import { $UnilingualInstrumentDetails, $UnilingualScalarInstrument } from './instrument.base.js';

const $InteractiveInstrument: z.ZodType<InteractiveInstrument> = $UnilingualScalarInstrument.extend({
  content: z.object({
    __injectHead: z
      .object({
        style: z.string().readonly()
      })
      .optional()
      .readonly(),
    render: z.function().args(z.any()).returns(z.any())
  }),
  details: $UnilingualInstrumentDetails.required({
    estimatedDuration: true,
    instructions: true
  }),
  kind: z.literal('INTERACTIVE')
});

export { $InteractiveInstrument };
