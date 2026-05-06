import type { InstrumentLanguage, SeriesInstrument } from '@opendatacapture/runtime-core';
import { z } from 'zod/v4';

import { $$BaseInstrument, $ScalarInstrumentInternal } from './instrument.base.js';

const $SeriesInstrumentParams = z.object({
  skipProgress: z.boolean().optional()
}) satisfies z.ZodType<SeriesInstrument.Params>;

const $SeriesInstrumentContent = z.union([
  z.array($ScalarInstrumentInternal),
  z.object({
    items: z.array($ScalarInstrumentInternal),
    params: $SeriesInstrumentParams.optional()
  })
]) satisfies z.ZodType<SeriesInstrument.Content>;

const $$SeriesInstrument = <TLanguage extends InstrumentLanguage>(language?: TLanguage) => {
  return $$BaseInstrument(language).extend({
    content: $SeriesInstrumentContent,
    kind: z.literal('SERIES')
  }) satisfies z.ZodType<SeriesInstrument<TLanguage>>;
};

const $SeriesInstrument = $$SeriesInstrument() satisfies z.ZodType<SeriesInstrument>;

export { $$SeriesInstrument, $SeriesInstrument };
