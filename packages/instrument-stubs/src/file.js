import { createInstrumentStub } from './utils.js';

/** @type {import('./utils.js').InstrumentStub<import('@opendatacapture/runtime-core').FileInstrument<import('@opendatacapture/runtime-core').Language[]>>} */
export const bilingualFileInstrument = await createInstrumentStub(async () => {
  const { z } = await import('zod/v4');
  return {
    __runtimeVersion: 1,
    content: {
      fileGroups: [
        {
          basename: 'file',
          count: 1,
          id: 'file',
          label: {
            en: 'File',
            fr: 'Fichier'
          },
          type: null
        }
      ]
    },
    details: {
      description: {
        en: 'This instrument is for a single arbitrary file.',
        fr: 'Cet instrument est destiné à un seul fichier arbitraire.'
      },
      license: 'Apache-2.0',
      title: {
        en: 'Arbitrary File',
        fr: 'Fichier arbitraire'
      }
    },
    internal: {
      edition: 1,
      name: 'ARBITRARY_SINGLE_FILE'
    },
    kind: 'FILE',
    language: ['en', 'fr'],
    measures: null,
    tags: {
      en: ['File'],
      fr: ['Fichier']
    },
    validationSchema: z.any()
  };
});
