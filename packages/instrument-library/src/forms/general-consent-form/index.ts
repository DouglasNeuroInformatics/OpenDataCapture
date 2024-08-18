/* eslint-disable perfectionist/sort-objects */

const { defineInstrument } = await import('/runtime/v1/@opendatacapture/runtime-core/index.js');
const { z } = await import('/runtime/v1/zod@3.23.6/index.js');

export default defineInstrument({
  kind: 'FORM',
  language: ['en', 'fr'],
  tags: {
    en: ['Consent'],
    fr: ['Consentement']
  },
  internal: {
    edition: 1,
    name: 'GENERAL_CONSENT_FORM'
  },
  content: [
    {
      title: {
        en: 'Terms and Conditions',
        fr: 'Conditions générales'
      },
      description: {
        en: 'You agree that all data you enter into our system will become the property of the Douglas Neuroinformatics Platform. You grant us full ownership of this data, allowing us to use, analyze, distribute, and share it for any purpose, including but not limited to research and performance improvement.',
        fr: "Vous acceptez que toutes les données que vous entrez dans notre système deviennent la propriété du Douglas Neuroinformatics Platform. Vous nous accordez la pleine propriété de ces données, ce qui nous permet de les utiliser, de les analyser, de les distribuer et de les partager à toutes fins, y compris, mais sans s'y limiter, à des fins de recherche et d'amélioration des performances."
      },
      fields: {
        consent: {
          kind: 'boolean',
          label: {
            en: 'I have read, understand, and agree to the above terms',
            fr: "J'ai lu, compris et accepté les conditions ci-dessus."
          },
          variant: 'checkbox'
        }
      }
    }
  ],
  details: {
    description: {
      en: 'The general consent form asks participants if they consent to their data being used for any purpose. This is intended for demo purposes and is not recommended for real-world research projects.',
      fr: "Le formulaire de consentement général demande aux participants s'ils acceptent que leurs données soient utilisées à quelque fin que ce soit. Ce formulaire est destiné à des fins de démonstration et n'est pas recommandé pour des projets de recherche réels."
    },
    estimatedDuration: 1,
    license: 'Apache-2.0',
    title: {
      en: 'General Consent Form',
      fr: 'Formulaire de consentement général'
    }
  },
  measures: null,
  validationSchema: z.object({
    consent: z.literal(true, { message: 'You must agree to the terms to continue' })
  })
});
