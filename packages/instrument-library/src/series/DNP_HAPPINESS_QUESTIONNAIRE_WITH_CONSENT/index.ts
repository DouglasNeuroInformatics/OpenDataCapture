import type { SeriesInstrument } from '/runtime/v1/@opendatacapture/runtime-core';

const instrument: SeriesInstrument = {
  __runtimeVersion: 1,
  kind: 'SERIES',
  language: ['en', 'fr'],
  tags: {
    en: ['Well-Being'],
    fr: ['Bien-être']
  },
  clientDetails: {
    instructions: {
      en: [
        'This instrument consists of two parts: a general consent form and a questionnaire to assess your happiness. Please complete both in a timely manner.'
      ],
      fr: [
        'Cet instrument se compose de deux parties : un formulaire de consentement général et un questionnaire pour évaluer votre bonheur. Veuillez remplir les deux en temps opportun.'
      ]
    }
  },
  details: {
    description: {
      en: 'The Happiness Questionnaire is a questionnaire about happiness.',
      fr: 'Le questionnaire sur le bonheur est un questionnaire sur le bonheur.'
    },
    license: 'Apache-2.0',
    title: {
      en: 'Happiness Questionnaire (With General Consent)',
      fr: 'Questionnaire sur le bonheur (avec consentement général)'
    }
  },
  content: [
    {
      name: 'GENERAL_CONSENT_FORM',
      edition: 1
    },
    {
      name: 'HAPPINESS_QUESTIONNAIRE',
      edition: 1
    }
  ]
};

export default instrument;
