/* eslint-disable perfectionist/sort-objects */

import { defineInstrument } from '/runtime/v1/@opendatacapture/runtime-core';
import { z } from '/runtime/v1/zod@3.23.x';

export default defineInstrument({
  kind: 'FORM',
  language: 'en',
  tags: ['<PLACEHOLDER>'],
  internal: {
    edition: 1,
    name: '<PLACEHOLDER>'
  },
  content: {},
  details: {
    description: '<PLACEHOLDER>',
    estimatedDuration: 1,
    instructions: ['<PLACEHOLDER>'],
    license: 'UNLICENSED',
    title: '<PLACEHOLDER>'
  },
  measures: {},
  validationSchema: z.object({})
});
