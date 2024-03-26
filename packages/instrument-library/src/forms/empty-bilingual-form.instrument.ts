/* eslint-disable perfectionist/sort-objects */

const { InstrumentFactory } = await import('/runtime/v1/core.js');
const { z } = await import('/runtime/v1/zod.js');

const instrumentFactory = new InstrumentFactory({
  kind: 'FORM',
  language: ['en', 'fr'],
  validationSchema: z.object({})
});

export default instrumentFactory.defineInstrument({
  name: ' ',
  tags: {
    en: [],
    fr: []
  },
  version: 1.0,
  content: {},
  details: {
    description: {
      en: ' ',
      fr: ' '
    },
    estimatedDuration: 1,
    instructions: {
      en: [],
      fr: []
    },
    license: 'UNLICENSED',
    title: {
      en: ' ',
      fr: ' '
    }
  }
});
