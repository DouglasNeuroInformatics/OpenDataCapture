/* eslint-disable perfectionist/sort-objects */

import { translations } from './translations.ts';

const { defineInstrument } = await import('/runtime/v1/opendatacapture@1.0.0/core.js');
const { i18n } = await import('/runtime/v1/opendatacapture@1.0.0/unstable/i18n.js');
const { z } = await import('/runtime/v1/zod@3.23.6/index.js');

i18n.init();

export default defineInstrument({
  kind: 'FORM',
  language: ['en', 'fr'],
  internal: {
    edition: 1,
    name: 'FAVORITE_COLOR'
  },
  tags: {
    en: ['Dynamic'],
    fr: ['Dynamique']
  },
  content: {
    hasFavoriteColor: {
      kind: 'boolean',
      label: {
        en: 'Do you have a favorite color?',
        fr: 'Avez-vous une couleur préférée ?'
      },
      variant: 'radio'
    },
    favoriteColor: {
      kind: 'dynamic',
      deps: ['hasFavoriteColor'],
      render(data) {
        if (!data?.hasFavoriteColor) {
          return null;
        }
        return {
          kind: 'string',
          label: {
            en: 'Favorite Color',
            fr: 'Couleur préférée'
          },
          options: {
            en: {
              red: 'Red',
              green: 'Green',
              blue: 'Blue'
            },
            fr: {
              red: 'Rouge',
              green: 'Vert',
              blue: 'Bleu'
            }
          },
          variant: 'select'
        };
      }
    }
  },
  details: {
    description: {
      en: 'This is an example of a simple form with conditional rendering and validation logic',
      fr: 'Voici un exemple de formulaire simple avec un rendu conditionnel et une logique de validation'
    },
    estimatedDuration: 1,
    instructions: {
      en: ['Please respond to all questions'],
      fr: ['Veuillez répondre à toutes les questions']
    },
    license: 'Apache-2.0',
    title: {
      en: 'Favorite Color',
      fr: 'Couleur préférée'
    }
  },
  measures: {},
  validationSchema: z
    .object({
      hasFavoriteColor: z.boolean({ message: translations.requiredField[i18n.resolvedLanguage] }),
      favoriteColor: z.enum(['red', 'blue', 'green']).optional()
    })
    .superRefine((data, ctx) => {
      if (data.hasFavoriteColor && !data.favoriteColor) {
        ctx.addIssue({
          code: 'custom',
          path: ['favoriteColor'],
          message: translations.requiredField[i18n.resolvedLanguage]
        });
      }
    })
});
