import { defineInstrument } from '/runtime/v1/@opendatacapture/runtime-core';
import { z } from '/runtime/v1/zod@3.x/v4';

export default defineInstrument({
  kind: 'FILE',
  language: ['en', 'fr'],
  tags: {
    en: ['File'],
    fr: ['Fichier']
  },
  internal: {
    edition: 1,
    name: 'ARBITRARY_SINGLE_FILE'
  },
  content: {
    fileGroups: [
      {
        basename: 'file',
        count: 1,
        type: null,
        label: {
          en: 'File',
          fr: 'Fichier'
        }
      }
    ]
  },
  measures: null,
  details: {
    description: {
      en: 'This instrument is for a single arbitrary file.',
      fr: 'Cet instrument est destiné à un seul fichier arbitraire.'
    },
    license: 'Apache-2.0',
    title: {
      en: 'Arbitrary File Upload',
      fr: 'Téléchargement de fichier arbitraire'
    }
  },

  validationSchema: z.any()
});
