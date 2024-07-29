/* eslint-disable perfectionist/sort-objects */

export default {
  kind: 'SERIES',
  language: ['en', 'fr'],
  tags: {
    en: ['Well-Being'],
    fr: ['Bien-être']
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
} satisfies import('/runtime/v1/opendatacapture@1.0.0/core.js').SeriesInstrument;
