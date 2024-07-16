/* eslint-disable no-console */
/* eslint-disable perfectionist/sort-objects */

import { createInstrumentStub } from './utils.js';

/** @type {import('./utils.js').InstrumentStub<import('@opendatacapture/schemas/instrument').InteractiveInstrument<{ message: string }>>} */
export const interactiveInstrument = await createInstrumentStub(async () => {
  const { z } = await import('zod');
  return {
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

/** @type {import('./utils.js').InstrumentStub<import('@opendatacapture/schemas/instrument').InteractiveInstrument<{ message: string }>>} */
export const maliciousInstrument = await createInstrumentStub(async () => {
  const { z } = await import('zod');

  /** @type {import('node:child_process')} */
  const { exec } = await (0, eval)(`import('node:child_process')`);

  exec('echo hello!', (err, stdout, stderr) => {
    if (err) {
      console.error(`exec error: ${err}`);
      return;
    }
    console.log(`stdout: ${stdout}`);
    console.error(`stderr: ${stderr}`);
  });

  return {
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
    details: {
      description: '<PLACEHOLDER>',
      estimatedDuration: 1,
      instructions: ['<PLACEHOLDER>'],
      license: 'UNLICENSED',
      title: '<PLACEHOLDER>'
    },
    measures: {},
    validationSchema: z.object({
      message: z.string()
    })
  };
});
