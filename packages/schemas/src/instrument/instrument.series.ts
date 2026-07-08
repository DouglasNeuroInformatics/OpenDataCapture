import type { InstrumentLanguage, SeriesInstrument } from '@opendatacapture/runtime-core';
import { z } from 'zod/v4';

import { $$BaseInstrument, $AnyDynamicFunction, $ScalarInstrumentInternal } from './instrument.base.js';

const $SeriesInstrumentParams = z.object({
  completionMessage: $AnyDynamicFunction.optional(),
  skipProgress: z.boolean().optional(),
  terminate: $AnyDynamicFunction.optional()
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
