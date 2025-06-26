import type { SeriesInstrument } from '@opendatacapture/runtime-core';
import { z } from 'zod/v4';

import { $BaseInstrument, $ScalarInstrumentInternal } from './instrument.base.js';

const $SeriesInstrument = $BaseInstrument.extend({
  content: z.array($ScalarInstrumentInternal),
  kind: z.literal('SERIES')
}) satisfies z.ZodType<SeriesInstrument>;

export { $SeriesInstrument };
