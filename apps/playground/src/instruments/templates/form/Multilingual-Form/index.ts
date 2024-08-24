/* eslint-disable perfectionist/sort-objects */

import { defineInstrument } from '/runtime/v1/@opendatacapture/runtime-core';
import { z } from '/runtime/v1/zod@3.23.x';

export default defineInstrument({
  kind: 'FORM',
  language: ['en', 'fr'],

  tags: {
    en: ['<PLACEHOLDER>'],
    fr: ['<PLACEHOLDER>']
  },
  internal: {
    edition: 1,
    name: '<PLACEHOLDER>'
  },
  content: {},
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
  measures: {},
  validationSchema: z.object({})
});
