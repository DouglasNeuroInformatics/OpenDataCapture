/* eslint-disable perfectionist/sort-objects */

import { createInstrumentStub } from './utils.js';

/**
 * @typedef {import('@opendatacapture/runtime-core').Language} Language
 * @typedef {{ favoriteNumber: number, reasonFavoriteNumberIsNegative?: string; }} FormInstrumentStubData
 */

/** @type {import('./utils.js').InstrumentStub<import('@opendatacapture/runtime-core').FormInstrument<FormInstrumentStubData, Language>>} */
export const unilingualFormInstrument = await createInstrumentStub(async () => {
  const { z } = await import('zod/v3');
  return {
    __runtimeVersion: 1,
    content: {
      favoriteNumber: {
        kind: 'number',
        label: 'Favorite Number',
        variant: 'input'
      },
      reasonFavoriteNumberIsNegative: {
        deps: ['favoriteNumber'],
        kind: 'dynamic',
        render(data) {
          if (!data?.favoriteNumber || data.favoriteNumber >= 0) {
            return null;
          }
          return {
            kind: 'string',
            label: 'Why is Your Favorite Number Negative?',
            variant: 'textarea'
          };
        }
      }
    },
    clientDetails: {
      title: 'Unilingual Form (Client Title)'
    },
    details: {
      authors: ['Jane Doe', 'John Smith'],
      description:
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
      estimatedDuration: 1,
      instructions: ['Please complete all questions'],
      license: 'Apache-2.0',
      sourceUrl: 'https://github.com',
      title: 'Unilingual Form'
    },
    measures: {
      favoriteNumber: {
        kind: 'const',
        ref: 'favoriteNumber'
      },
      hasNegativeFavoriteNumber: {
        kind: 'computed',
        label: 'Has Negative Favorite Number',
        value: (data) => 0 > data.favoriteNumber
      }
    },
    kind: 'FORM',
    language: 'en',

    tags: ['Example', 'Preferences'],
    validationSchema: z.object({
      favoriteNumber: z.number(),
      reasonFavoriteNumberIsNegative: z.string().optional()
    }),
    internal: {
      edition: 1,
      name: 'UNILINGUAL_FORM'
    }
  };
});

/** @type {import('./utils.js').InstrumentStub<import('@opendatacapture/runtime-core').FormInstrument<FormInstrumentStubData, Language[]>>} */
export const bilingualFormInstrument = await createInstrumentStub(async () => {
  const { z } = await import('zod/v4');
  return {
    __runtimeVersion: 1,
    content: {
      favoriteNumber: {
        kind: 'number',
        label: {
          en: 'Favorite Number',
          fr: 'Numéro préféré'
        },
        variant: 'input'
      },
      reasonFavoriteNumberIsNegative: {
        deps: ['favoriteNumber'],
        kind: 'dynamic',
        render(data) {
          if (!data?.favoriteNumber || data.favoriteNumber >= 0) {
            return null;
          }
          return {
            kind: 'string',
            label: {
              en: 'Why is Your Favorite Number Negative?',
              fr: 'Pourquoi votre nombre préféré est-il négatif ?'
            },
            variant: 'textarea'
          };
        }
      }
    },
    details: {
      description: {
        en: 'This is a bilingual form instrument',
        fr: "Il s'agit d'un instrument bilingue"
      },
      estimatedDuration: 1,
      instructions: {
        en: ['Please complete all questions'],
        fr: ['Veuillez répondre à toutes les questions']
      },
      license: 'Apache-2.0',
      title: {
        en: 'Bilingual Form',
        fr: 'Formulaire bilingue'
      }
    },
    kind: 'FORM',
    language: ['en', 'fr'],

    tags: {
      en: ['Example', 'Preferences'],
      fr: ['Exemple', 'Préférences']
    },
    measures: {},
    validationSchema: z.object({
      favoriteNumber: z.number(),
      reasonFavoriteNumberIsNegative: z.string().optional()
    }),
    internal: {
      name: 'BILINGUAL_FORM',
      edition: 1
    }
  };
});
