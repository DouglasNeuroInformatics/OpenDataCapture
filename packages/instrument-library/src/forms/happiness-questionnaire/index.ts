/* eslint-disable perfectionist/sort-objects */

const { defineInstrument } = await import('/runtime/v1/opendatacapture@1.0.0/core.js');
const { z } = await import('/runtime/v1/zod@3.23.6/index.js');

export default defineInstrument({
  kind: 'FORM',
  language: ['en', 'fr'],
  name: 'HappinessQuestionnaire',
  tags: {
    en: ['Well-Being'],
    fr: ['Bien-être']
  },
  version: 1,
  content: {
    overallHappiness: {
      description: {
        en: 'Overall happiness from 1 through 10 (inclusive)',
        fr: 'Bonheur général de 1 à 10 (inclus)'
      },
      kind: 'number',
      label: {
        en: 'Overall Happiness',
        fr: 'Bonheur général'
      },
      max: 10,
      min: 1,
      variant: 'slider'
    },
    reasonForSadness: {
      deps: ['overallHappiness'],
      kind: 'dynamic',
      render: (data) => {
        if (!data?.overallHappiness || data.overallHappiness >= 5) {
          return null;
        }
        return {
          label: {
            en: 'Reason for Sadness',
            fr: 'Raison de la tristesse'
          },
          isRequired: false,
          kind: 'string',
          variant: 'textarea'
        };
      }
    }
  },
  details: {
    description: {
      en: 'The Happiness Questionnaire is a questionnaire about happiness.',
      fr: 'Le questionnaire sur le bonheur est un questionnaire sur le bonheur.'
    },
    estimatedDuration: 1,
    instructions: {
      en: ['Please answer the question based on your current feelings.'],
      fr: ['Veuillez répondre à la question en fonction de vos sentiments actuels.']
    },
    license: 'AGPL-3.0',
    title: {
      en: 'Happiness Questionnaire',
      fr: 'Questionnaire sur le bonheur'
    }
  },
  measures: {
    overallHappiness: {
      kind: 'const',
      ref: 'overallHappiness'
    }
  },
  validationSchema: z.object({
    overallHappiness: z.number().int().gte(1).lte(10),
    reasonForSadness: z.string().optional()
  })
});
