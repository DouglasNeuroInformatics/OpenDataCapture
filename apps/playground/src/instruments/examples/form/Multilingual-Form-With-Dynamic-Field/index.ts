/* eslint-disable perfectionist/sort-objects */

import { defineInstrument } from '/runtime/v1/@opendatacapture/runtime-core';
import { z } from '/runtime/v1/zod@3.23.x';

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
  clientDetails: {
    estimatedDuration: 1,
    instructions: {
      en: ['Please respond to all questions'],
      fr: ['Veuillez répondre à toutes les questions']
    }
  },
  details: {
    description: {
      en: 'This is an example of a simple form with conditional rendering and validation logic',
      fr: 'Voici un exemple de formulaire simple avec un rendu conditionnel et une logique de validation'
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
      hasFavoriteColor: z.boolean({ message: 'This field is required' }),
      favoriteColor: z.enum(['red', 'blue', 'green']).optional()
    })
    .superRefine((data, ctx) => {
      if (data.hasFavoriteColor && !data.favoriteColor) {
        ctx.addIssue({
          code: 'custom',
          path: ['favoriteColor'],
          message: 'This field is required'
        });
      }
    })
});
