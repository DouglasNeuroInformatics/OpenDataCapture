/* eslint-disable perfectionist/sort-objects */

const { defineInstrument } = await import('/runtime/v1/core.js');
const { z } = await import('/runtime/v1/zod.js');

export default defineInstrument({
  kind: 'FORM',
  language: ['en', 'fr'],
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
  },
  validationSchema: z.object({})
});
