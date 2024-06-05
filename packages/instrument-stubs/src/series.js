/* eslint-disable perfectionist/sort-objects */

import { createInstrumentStub } from './utils.js';

/** @type {import('./utils.js').InstrumentStub<import('@opendatacapture/schemas/instrument').SeriesInstrument>} */
export const seriesInstrument = await createInstrumentStub(async () => {
  const { z } = await import('zod');
  return {
    kind: 'SERIES',
    language: 'en',
    name: 'SERIES_INSTRUMENT',
    tags: ['Example', 'Useless'],
    edition: 1,
    content: {
      ids: []
    },
    details: {
      description: 'This is a series instrument',
      estimatedDuration: 1,
      instructions: [],
      license: 'UNLICENSED',
      title: 'Series Instrument'
    },
    measures: null,
    validationSchema: z.undefined()
  };
});
