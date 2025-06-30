/* eslint-disable perfectionist/sort-objects */

import { defineInstrument } from '/runtime/v1/@opendatacapture/runtime-core';
import { z } from '/runtime/v1/zod@3.x';

export default defineInstrument({
  kind: 'INTERACTIVE',
  language: 'en',
  tags: ['<PLACEHOLDER>'],
  internal: {
    edition: 1,
    name: '<PLACEHOLDER>'
  },
  content: {
    render(done) {
      const button = document.createElement('button');
      button.textContent = 'Submit Instrument';
      document.body.appendChild(button);
      button.addEventListener('click', () => {
        done({ message: 'Hello World' });
      });
    }
  },
  clientDetails: {
    estimatedDuration: 1,
    instructions: ['<PLACEHOLDER>']
  },
  details: {
    description: '<PLACEHOLDER>',
    license: 'Apache-2.0',
    title: '<PLACEHOLDER>'
  },
  measures: {},
  validationSchema: z.object({
    message: z.string()
  })
});
