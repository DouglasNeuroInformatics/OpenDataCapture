/* eslint-disable perfectionist/sort-objects */

type HappinessQuestionnaireData = {
  overallHappiness: number;
};

const happinessQuestionnaire: FormInstrument<HappinessQuestionnaireData, InstrumentLanguage> = {
  kind: 'form',
  name: 'HappinessQuestionnaire',
  language: ['en', 'fr'],
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
  validationSchema: z.object({
    overallHappiness: z.number().int().gte(1).lte(10)
  })
};

export default happinessQuestionnaire;
