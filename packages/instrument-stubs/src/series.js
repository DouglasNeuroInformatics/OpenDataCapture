/* eslint-disable perfectionist/sort-objects */

import { createInstrumentStub } from './utils.js';

/** @type {import('./utils.js').InstrumentStub<import('@opendatacapture/runtime-core').SeriesInstrument>} */
export const seriesInstrument = await createInstrumentStub(async () => {
  return {
    kind: 'SERIES',
    language: 'en',
    tags: ['Example', 'Useless'],
    content: [
      {
        name: 'HAPPINESS_QUESTIONNAIRE',
        edition: 1
      }
    ],
    details: {
      description: 'This is a series instrument',
      license: 'UNLICENSED',
      title: 'Series Instrument'
    }
  };
});
