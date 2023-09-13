import { createTranslatedForms } from '../utils/create-translated-forms.js';

export type HappinessQuestionnaireData = {
  overallHappiness: number;
}

export const happinessQuestionnaire = createTranslatedForms<HappinessQuestionnaireData>({
  name: 'HappinessQuestionnaire',
  tags: ['Well-Being'],
  version: 1,
  details: {
    title: {
      en: 'Happiness Questionnaire',
      fr: 'Questionnaire sur le bonheur'
    },
    description: {
      en: 'The Happiness Questionnaire is a questionnaire about happiness.',
      fr: 'Le questionnaire sur le bonheur est un questionnaire sur le bonheur.'
    },
    instructions: {
      en: 'Please answer the question based on your current feelings.',
      fr: 'Veuillez répondre à la question en fonction de vos sentiments actuels.'
    },
    estimatedDuration: 1
  },
  content: {
    overallHappiness: {
      kind: 'numeric',
      label: {
        en: 'Overall Happiness',
        fr: 'Bonheur général'
      },
      description: {
        en: 'Overall happiness from 1 through 10 (inclusive)',
        fr: 'Bonheur général de 1 à 10 (inclus)'
      },
      isRequired: true,
      min: 1,
      max: 10,
      variant: 'slider'
    }
  },
  measures: {
    overallHappiness: {
      label: {
        en: 'Overall Happiness',
        fr: 'Bonheur général'
      },
      formula: {
        kind: 'const',
        field: 'overallHappiness'
      }
    }
  },
  validationSchema: {
    type: 'object',
    properties: {
      overallHappiness: {
        type: 'integer',
        minimum: 1,
        maximum: 10
      }
    },
    required: ['overallHappiness']
  }
});
