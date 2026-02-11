import type { InstrumentLanguage, InteractiveInstrument } from '@opendatacapture/runtime-core';
import { z } from 'zod/v4';

import { $$InstrumentDetails, $$ScalarInstrument, $AnyDynamicFunction } from './instrument.base.js';

const $$InteractiveInstrument = <TLanguage extends InstrumentLanguage>(language?: TLanguage) => {
  return $$ScalarInstrument(language).extend({
    content: z.object({
      __injectHead: z
        .object({
          scripts: z.array(z.string().readonly()).readonly().optional(),
          style: z.string().readonly().optional()
        })
        .optional()
        .readonly(),
      html: z.string().optional(),
      meta: z.record(z.string(), z.string()).optional(),
      render: $AnyDynamicFunction,
      staticAssets: z.record(z.string(), z.string()).optional()
    }),
    details: $$InstrumentDetails(language),
    kind: z.literal('INTERACTIVE')
  }) satisfies z.ZodType<InteractiveInstrument<InteractiveInstrument.Data, TLanguage>>;
};

const $InteractiveInstrument = $$InteractiveInstrument() satisfies z.ZodType<InteractiveInstrument>;

export { $$InteractiveInstrument, $InteractiveInstrument };
