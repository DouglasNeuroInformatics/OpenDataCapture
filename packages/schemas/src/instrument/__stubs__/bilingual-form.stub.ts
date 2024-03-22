/* eslint-disable perfectionist/sort-objects */

import { z } from 'zod';

export const bilingualForm = {
  kind: 'FORM',
  language: ['en', 'fr'],
  validationSchema: z.object({
    favoriteNumber: z.number().int()
  }),
  name: 'Bilingual Form',
  tags: {
    en: ['Example'],
    fr: ['Exemple']
  },
  version: 1.0,
  content: {
    favoriteNumber: {
      kind: 'numeric',
      label: {
        en: 'Favorite Number',
        fr: 'Numéro préféré'
      },
      variant: 'slider'
    }
  },
  details: {
    description: {
      en: ' ',
      fr: ' '
    },
    estimatedDuration: 1,
    instructions: {
      en: [],
      fr: []
    },
    license: 'UNLICENSED',
    title: {
      en: ' ',
      fr: ' '
    }
  }
};
