/* eslint-disable perfectionist/sort-objects */

import type { InteractiveInstrument } from '@opendatacapture/schemas/instrument';

import { createInstrumentStub } from './utils.js';

type InteractiveInstrumentStubData = {
  message: string;
};

export const interactiveInstrument = await createInstrumentStub<InteractiveInstrument<InteractiveInstrumentStubData>>(
  async () => {
    const { z } = await import('zod');
    return {
      kind: 'INTERACTIVE',
      language: 'en',
      name: 'interactive-instrument',
      tags: ['Example'],
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
    };
  }
);
