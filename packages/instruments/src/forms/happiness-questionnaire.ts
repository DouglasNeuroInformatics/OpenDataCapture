import { createTranslatedForms } from '../utils/create-translated-forms';

export type HappinessQuestionnaireData = {
  overallHappiness: number;
};

export const happinessQuestionnaire = createTranslatedForms<HappinessQuestionnaireData>({
  content: {
    overallHappiness: {
      description: {
        en: 'Overall happiness from 1 through 10 (inclusive)',
        fr: 'Bonheur général de 1 à 10 (inclus)'
      },
      isRequired: true,
      kind: 'numeric',
      label: {
        en: 'Overall Happiness',
        fr: 'Bonheur général'
      },
      max: 10,
      min: 1,
      variant: 'slider'
    }
  },
  details: {
    description: {
      en: 'The Happiness Questionnaire is a questionnaire about happiness.',
      fr: 'Le questionnaire sur le bonheur est un questionnaire sur le bonheur.'
    },
    estimatedDuration: 1,
    instructions: {
      en: 'Please answer the question based on your current feelings.',
      fr: 'Veuillez répondre à la question en fonction de vos sentiments actuels.'
    },
    title: {
      en: 'Happiness Questionnaire',
      fr: 'Questionnaire sur le bonheur'
    }
  },
  measures: {
    overallHappiness: {
      formula: {
        field: 'overallHappiness',
        kind: 'const'
      },
      label: {
        en: 'Overall Happiness',
        fr: 'Bonheur général'
      }
    }
  },
  name: 'HappinessQuestionnaire',
  tags: ['Well-Being'],
  validationSchema: {
    properties: {
      overallHappiness: {
        maximum: 10,
        minimum: 1,
        type: 'integer'
      }
    },
    required: ['overallHappiness'],
    type: 'object'
  },
  version: 1
});
