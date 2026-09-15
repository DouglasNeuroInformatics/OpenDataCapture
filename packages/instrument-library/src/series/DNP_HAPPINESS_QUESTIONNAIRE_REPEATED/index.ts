import { defineSeriesInstrument } from '/runtime/v1/@opendatacapture/runtime-core';

export default defineSeriesInstrument({
  kind: 'SERIES',
  language: ['en', 'fr'],
  tags: {
    en: ['Well-Being'],
    fr: ['Bien-être']
  },
  clientDetails: {
    instructions: {
      en: [
        'You will answer the same questionnaire twice in a row: once about how you feel right now, and once about how you felt a month ago. Answer each one on its own.'
      ],
      fr: [
        'Vous répondrez deux fois de suite au même questionnaire : une fois sur votre état actuel, une fois sur votre état il y a un mois. Répondez à chacun indépendamment.'
      ]
    }
  },
  details: {
    description: {
      en: 'Two administrations of the Happiness Questionnaire in one sitting, presented back to back without an interstitial screen.',
      fr: "Deux administrations du questionnaire sur le bonheur en une seule séance, présentées l'une après l'autre sans écran intermédiaire."
    },
    license: 'Apache-2.0',
    title: {
      en: 'Happiness Questionnaire (Repeated)',
      fr: 'Questionnaire sur le bonheur (répété)'
    }
  },
  content: {
    items: [
      {
        name: 'DNP_HAPPINESS_QUESTIONNAIRE',
        edition: 1
      },
      {
        name: 'DNP_HAPPINESS_QUESTIONNAIRE',
        edition: 1
      }
    ],
    params: {
      // The two items share every field name, so each administration must start empty. This is the
      // catalog's only coverage of that: `skipProgress` removes the interstitial screen, which was
      // once the only thing unmounting the form between items.
      skipProgress: true
    }
  }
});
