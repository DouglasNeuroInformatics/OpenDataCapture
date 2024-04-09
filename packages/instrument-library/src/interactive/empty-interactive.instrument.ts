/* eslint-disable perfectionist/sort-objects */

const { defineInstrument } = await import('/runtime/v1/core.js');
const { z } = await import('/runtime/v1/zod.js');

export default defineInstrument({
  kind: 'INTERACTIVE',
  language: 'en',
  name: ' ',
  tags: [],
  version: 1.0,
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
  details: {
    description: ' ',
    estimatedDuration: 1,
    instructions: [],
    license: 'UNLICENSED',
    title: ' '
  },
  validationSchema: z.object({
    message: z.string()
  })
});
