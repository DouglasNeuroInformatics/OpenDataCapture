/* eslint-disable perfectionist/sort-objects */

const { defineInstrument } = await import('/runtime/v1/core.js');
const { z } = await import('/runtime/v1/zod.js');

export default defineInstrument({
  kind: 'FORM',
  language: ['en', 'fr'],
  name: '<PLACEHOLDER>',
  tags: {
    en: ['<PLACEHOLDER>'],
    fr: ['<PLACEHOLDER>']
  },
  version: 1.0,
  content: [
    {
      title: {
        en: '<PLACEHOLDER>',
        fr: '<PLACEHOLDER>'
      },
      description: {
        en: '<PLACEHOLDER>',
        fr: '<PLACEHOLDER>'
      },
      fields: {
        // here, you write the fields like you would in the ungrouped instrument
      }
    }
  ],
  details: {
    description: {
      en: '<PLACEHOLDER>',
      fr: '<PLACEHOLDER>'
    },
    estimatedDuration: 1,
    instructions: {
      en: ['<PLACEHOLDER>'],
      fr: ['<PLACEHOLDER>']
    },
    license: 'UNLICENSED',
    title: {
      en: '<PLACEHOLDER>',
      fr: '<PLACEHOLDER>'
    }
  },
  validationSchema: z.object({})
});
