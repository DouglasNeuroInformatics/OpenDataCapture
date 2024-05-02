/* eslint-disable perfectionist/sort-objects */

const { defineInstrument } = await import('/runtime/v1/core.js');
const { z } = await import('/runtime/v1/zod.js');

import './legacy.js';

export default defineInstrument({
  kind: 'INTERACTIVE',
  language: 'en',
  name: 'INTERACTIVE_WITH_LEGACY_SCRIPT',
  tags: ['Legacy', 'Internet Explorer 6'],
  version: 1.0,
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
    license: 'AGPL-3.0',
    title: 'Interactive Instrument With Legacy Script'
  },
  validationSchema: z.object({
    message: z.string()
  })
});
