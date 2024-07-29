import type { Merge } from 'type-fest';
import { z } from 'zod';

import { $UnilingualScalarInstrument, type BaseInstrument, type InstrumentLanguage } from './instrument.base.js';

type SeriesInstrumentContent = {
  ids: string[];
};

export type SeriesInstrument<TLanguage extends InstrumentLanguage = InstrumentLanguage> = Merge<
  BaseInstrument<TLanguage>,
  {
    content: SeriesInstrumentContent;
    kind: 'SERIES';
    measures: null;
  }
>;

export const $SeriesInstrument: z.ZodType<SeriesInstrument> = $UnilingualScalarInstrument.extend({
  content: z.object({
    ids: z.array(z.string())
  }),
  kind: z.literal('SERIES'),
  measures: z.null()
});
