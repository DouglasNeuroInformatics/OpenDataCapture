/* eslint-disable perfectionist/sort-objects */

const { defineInstrument } = await import('/runtime/v1/opendatacapture@1.0.0/core.js');
const { z } = await import('/runtime/v1/zod@3.23.6/index.js');

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
  details: {
    description: 'This is an example of how ancient scripts, that fail in strict mode, can be used in an instrument.',
    estimatedDuration: 1,
    instructions: ['Please complete the task.'],
    license: 'Apache-2.0',
    title: 'Interactive Instrument With Legacy Script'
  },
  measures: {},
  validationSchema: z.object({
    message: z.string()
  })
});
