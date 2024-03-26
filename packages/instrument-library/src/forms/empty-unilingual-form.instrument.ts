/* eslint-disable perfectionist/sort-objects */

const { InstrumentFactory } = await import('/runtime/v1/core.js');
const { z } = await import('/runtime/v1/zod.js');

const instrumentFactory = new InstrumentFactory({
  kind: 'FORM',
  language: 'en',
  validationSchema: z.object({})
});

export default instrumentFactory.defineInstrument({
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
  }
});
