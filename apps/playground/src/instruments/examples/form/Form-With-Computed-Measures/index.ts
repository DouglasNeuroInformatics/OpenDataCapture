/* eslint-disable perfectionist/sort-objects */

const { defineInstrument } = await import('/runtime/v1/opendatacapture@1.0.0/core.js');
const { mean } = await import('/runtime/v1/lodash-es@4.17.21/index.js');
const { z } = await import('/runtime/v1/zod@3.23.6/index.js');

const CURRENT_YEAR = new Date().getFullYear();
const LAST_YEAR = CURRENT_YEAR - 1;

export default defineInstrument({
  kind: 'FORM',
  language: 'en',
  internal: {
    edition: 1,
    name: 'HAPPINESS_QUESTIONNAIRE'
  },
  tags: ['Well-Being'],
  content: {
    overallHappinessCurrentYear: {
      description: 'Overall happiness from 1 through 10 (inclusive)',
      kind: 'number',
      label: `Overall Happiness in ${CURRENT_YEAR}`,
      max: 10,
      min: 1,
      variant: 'slider'
    },
    overallHappinessLastYear: {
      description: 'Overall happiness from 1 through 10 (inclusive)',
      kind: 'number',
      label: `Overall Happiness in ${LAST_YEAR}`,
      max: 10,
      min: 1,
      variant: 'slider'
    }
  },
  details: {
    description: 'This is an example of a form with computed measures',
    estimatedDuration: 1,
    instructions: ['Please respond to all questions'],
    license: 'Apache-2.0',
    title: 'Happiness Questionnaire'
  },
  measures: {
    overallHappinessCurrentYear: {
      kind: 'const',
      ref: 'overallHappinessCurrentYear'
    },
    overallHappinessLastYear: {
      kind: 'const',
      ref: 'overallHappinessLastYear'
    },
    meanOverallHappiness: {
      kind: 'computed',
      label: 'Mean Overall Happiness',
      value: (data) => {
        return mean(Object.values(data));
      }
    }
  },
  validationSchema: z.object({
    overallHappinessCurrentYear: z.number().int().gte(1).lte(10),
    overallHappinessLastYear: z.number().int().gte(1).lte(10)
  })
});
