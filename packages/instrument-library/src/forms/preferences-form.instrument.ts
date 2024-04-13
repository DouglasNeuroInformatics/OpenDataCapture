/* eslint-disable perfectionist/sort-objects */

const { defineInstrument } = await import('/runtime/v1/core.js');
const { z } = await import('/runtime/v1/zod.js');

export default defineInstrument({
  kind: 'FORM',
  language: ['en', 'fr'],
  name: 'PREFERENCES',
  tags: {
    en: ['Preferences'],
    fr: ['Préférences']
  },
  version: 1.0,
  content: [
    {
      title: {
        en: 'Favorite Color',
        fr: 'Couleur préférée'
      },
      description: {
        en: 'In this section, you will be able to indicate your favorite color',
        fr: 'Dans cette section, vous pourrez indiquer votre couleur préférée'
      },
      fields: {
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
      }
    }
  ],
  details: {
    description: {
      en: 'This is an example of a grouped form with conditional rendering and validation logic',
      fr: 'Voici un exemple de formulaire groupé avec un rendu conditionnel et une logique de validation'
    },
    estimatedDuration: 1,
    instructions: {
      en: ['Please respond to all questions shown'],
      fr: ['Veuillez répondre à toutes les questions indiquées']
    },
    license: 'AGPL-3.0',
    title: {
      en: 'Preferences',
      fr: 'Préférences'
    }
  },
  validationSchema: z
    .object({
      hasFavoriteColor: z.boolean(),
      favoriteColor: z.enum(['red', 'blue', 'green']).optional()
    })
    .refine((data) => {
      if (data.hasFavoriteColor && !data.favoriteColor) {
        return false;
      }
      return true;
    })
});
