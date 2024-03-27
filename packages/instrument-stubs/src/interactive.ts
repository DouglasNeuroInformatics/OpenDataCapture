/* eslint-disable perfectionist/sort-objects */

import { deepFreeze } from '@douglasneuroinformatics/libjs';
import type { InteractiveInstrument } from '@opendatacapture/schemas/instrument';
import { z } from 'zod';

type InteractiveInstrumentStubData = {
  message: string;
};

export const INTERACTIVE_INSTRUMENT = deepFreeze({
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
} satisfies InteractiveInstrument<InteractiveInstrumentStubData>) as any as InteractiveInstrument<InteractiveInstrumentStubData>;
