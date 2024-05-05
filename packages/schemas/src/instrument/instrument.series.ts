import type { Merge } from 'type-fest';
import { z } from 'zod';

import { $UnilingualBaseInstrument, type BaseInstrument } from './instrument.base.js';

import type { Language } from '../core/core.js';

type SeriesInstrumentContent = {
  ids: string[];
};

export type SeriesInstrument = Merge<
  BaseInstrument<undefined, Language>,
  {
    content: SeriesInstrumentContent;
    kind: 'SERIES';
    measures: null;
  }
>;

export const $SeriesInstrument: z.ZodType<SeriesInstrument> = $UnilingualBaseInstrument.extend({
  content: z.object({
    ids: z.array(z.string())
  }),
  kind: z.literal('SERIES'),
  measures: z.null()
});
