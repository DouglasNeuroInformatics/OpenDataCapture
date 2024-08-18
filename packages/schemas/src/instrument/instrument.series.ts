import type { SeriesInstrument } from '@opendatacapture/runtime-core';
import { z } from 'zod';

import { $BaseInstrument, $ScalarInstrumentInternal } from './instrument.base.js';

const $SeriesInstrument: z.ZodType<SeriesInstrument> = $BaseInstrument.extend({
  content: z.array($ScalarInstrumentInternal),
  kind: z.literal('SERIES')
});

export { $SeriesInstrument };
