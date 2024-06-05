/* eslint-disable perfectionist/sort-objects */

const { defineInstrument } = await import('/runtime/v1/opendatacapture@1.0.0/core.js');
const { z } = await import('/runtime/v1/zod@3.23.6/index.js');

export default defineInstrument({
  kind: 'FORM',
  language: 'en',
  internal: {
    edition: 1,
    name: 'FAVORITE_COLOR'
  },
  tags: ['Dynamic'],
  content: {
    hasFavoriteColor: {
      kind: 'boolean',
      label: 'Do you have a favorite color?',
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
          label: 'Favorite Color',
          options: {
            red: 'Red',
            green: 'Green',
            blue: 'Blue'
          },
          variant: 'select'
        };
      }
    }
  },
  details: {
    description: 'This is an example of a simple form with conditional rendering and validation logic',
    estimatedDuration: 1,
    instructions: ['Please respond to all questions'],
    license: 'AGPL-3.0',
    title: 'Favorite Color'
  },
  measures: {},
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
