/* eslint-disable perfectionist/sort-objects */

const { defineInstrument } = await import('/runtime/v1/core.js');
const { z } = await import('/runtime/v1/zod.js');

export default defineInstrument({
  kind: 'FORM',
  language: 'en',
  name: ' ',
  tags: [],
  version: 1.0,
  content: {},
  details: {
    description: ' ',
    estimatedDuration: 1,
    instructions: [],
    license: 'UNLICENSED',
    title: ' '
  },
  validationSchema: z.object({})
});
