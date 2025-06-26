/* eslint-disable perfectionist/sort-objects */

import { createInstrumentStub } from './utils.js';

/** @type {import('./utils.js').InstrumentStub<import('@opendatacapture/runtime-core').InteractiveInstrument<{ message: string }>>} */
export const interactiveInstrument = await createInstrumentStub(async () => {
  const { z } = await import('zod/v4');
  return {
    __runtimeVersion: 1,
    kind: 'INTERACTIVE',
    language: 'en',
    tags: ['Example', 'Useless'],
    internal: {
      edition: 1,
      name: 'INTERACTIVE_INSTRUMENT'
    },
    content: {
      render(done) {
        document.body.style.display = 'flex';
        document.body.style.flexDirection = 'column';
        document.body.style.placeContent = 'center';
        document.body.style.height = '100vh';
        document.body.style.width = '100vw';
        document.body.style.padding = '0px';
        document.body.style.margin = '0px';

        const button = document.createElement('button');
        button.style.margin = 'auto';
        button.textContent = 'Submit Instrument';

        document.body.appendChild(button);
        button.addEventListener('click', () => {
          done({ message: 'Hello World' });
        });
      }
    },
    details: {
      description: 'This is an interactive instrument',
      estimatedDuration: 1,
      instructions: [],
      license: 'UNLICENSED',
      title: 'Interactive Instrument'
    },
    measures: {},
    validationSchema: z.object({
      message: z.string()
    })
  };
});
