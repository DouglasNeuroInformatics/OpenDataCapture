/* eslint-disable perfectionist/sort-objects */

import { defineInstrument } from '/runtime/v1/@opendatacapture/runtime-core';
import { z } from '/runtime/v1/zod@3.x';

export default defineInstrument({
  kind: 'FORM',
  language: 'en',
  tags: ['<PLACEHOLDER>'],
  internal: {
    edition: 1,
    name: '<PLACEHOLDER>'
  },
  clientDetails: {
    estimatedDuration: 1,
    instructions: ['<PLACEHOLDER>']
  },
  content: {},
  details: {
    description: '<PLACEHOLDER>',
    license: 'Apache-2.0',
    title: '<PLACEHOLDER>'
  },
  measures: {},
  validationSchema: z.object({})
});
