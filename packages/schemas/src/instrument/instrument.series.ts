import type { InstrumentLanguage, SeriesInstrument } from '@opendatacapture/runtime-core';
import { z } from 'zod/v4';

import { $$BaseInstrument, $ScalarInstrumentInternal } from './instrument.base.js';

const $$SeriesInstrument = <TLanguage extends InstrumentLanguage>(language?: TLanguage) => {
  return $$BaseInstrument(language).extend({
    content: z.array($ScalarInstrumentInternal),
    kind: z.literal('SERIES')
  }) satisfies z.ZodType<SeriesInstrument<TLanguage>>;
};

const $SeriesInstrument = $$SeriesInstrument() satisfies z.ZodType<SeriesInstrument>;

export { $$SeriesInstrument, $SeriesInstrument };
