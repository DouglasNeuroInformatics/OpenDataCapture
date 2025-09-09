import { $AnyFunction } from '@douglasneuroinformatics/libjs';
import type { InteractiveInstrument } from '@opendatacapture/runtime-core';
import { z } from 'zod/v4';

import { $InstrumentDetails, $ScalarInstrument } from './instrument.base.js';

const $InteractiveInstrument = $ScalarInstrument.extend({
  content: z.object({
    __injectHead: z
      .object({
        scripts: z.array(z.string().readonly()).readonly().optional(),
        style: z.string().readonly().optional()
      })
      .optional()
      .readonly(),
    html: z.string().optional(),
    render: $AnyFunction
  }),
  details: $InstrumentDetails,
  kind: z.literal('INTERACTIVE')
}) satisfies z.ZodType<InteractiveInstrument>;

export { $InteractiveInstrument };
