import type { InteractiveInstrument } from '@opendatacapture/runtime-core';
import { z } from 'zod';

import { $InstrumentDetails, $ScalarInstrument } from './instrument.base.js';

const $InteractiveInstrument: z.ZodType<InteractiveInstrument> = $ScalarInstrument.extend({
  content: z.object({
    __injectHead: z
      .object({
        style: z.string().readonly()
      })
      .optional()
      .readonly(),
    render: z.function().args(z.any()).returns(z.any())
  }),
  details: $InstrumentDetails,
  kind: z.literal('INTERACTIVE')
});

export { $InteractiveInstrument };
