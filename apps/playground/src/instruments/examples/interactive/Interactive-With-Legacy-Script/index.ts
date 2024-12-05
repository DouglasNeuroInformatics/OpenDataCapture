/* eslint-disable perfectionist/sort-objects */

import { defineInstrument } from '/runtime/v1/@opendatacapture/runtime-core';
import { z } from '/runtime/v1/zod@3.23.x';

import './legacy.js';

export default defineInstrument({
  kind: 'INTERACTIVE',
  language: 'en',
  internal: {
    edition: 1,
    name: 'INTERACTIVE_WITH_LEGACY_SCRIPT'
  },
  tags: ['Legacy', 'Internet Explorer 6'],
  content: {
    render(done) {
      const button = document.createElement('button');
      button.textContent = 'Submit Instrument';
      document.body.appendChild(button);
      button.addEventListener('click', () => {
        done({ message });
      });
    }
  },
  clientDetails: {
    estimatedDuration: 1,
    instructions: ['Please complete the task.']
  },
  details: {
    description: 'This is an example of how ancient scripts, that fail in strict mode, can be used in an instrument.',
    license: 'Apache-2.0',
    title: 'Interactive Instrument With Legacy Script'
  },
  measures: {},
  validationSchema: z.object({
    message: z.string()
  })
});
