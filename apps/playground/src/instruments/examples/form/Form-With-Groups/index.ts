/* eslint-disable perfectionist/sort-objects */

import { defineInstrument } from '/runtime/v1/@opendatacapture/runtime-core';
import { z } from '/runtime/v1/zod@3.x';

export default defineInstrument({
  kind: 'FORM',
  language: ['en', 'fr'],
  internal: {
    edition: 1,
    name: 'HAPPINESS_QUESTIONNAIRE'
  },
  tags: {
    en: ['Well-Being'],
    fr: ['Bien-être']
  },
  content: [
    {
      title: {
        en: 'Personal Information',
        fr: 'Renseignements personnels'
      },
      description: {
        en: 'Please provide the following information for our records',
        fr: 'Veuillez fournir les informations suivantes pour nos dossiers'
      },
      fields: {
        firstName: {
          kind: 'string',
          label: {
            en: 'First Name',
            fr: 'Prénom'
          },
          variant: 'input'
        },
        lastName: {
          kind: 'string',
          label: {
            en: 'Last Name',
            fr: 'Nom'
          },
          variant: 'input'
        },
        dateOfBirth: {
          kind: 'date',
          label: {
            en: 'Date of Birth',
            fr: 'Date de naissance'
          }
        }
      }
    },
    {
      title: {
        en: 'Questions Regarding Life',
        fr: 'Questions sur la vie'
      },
      fields: {
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
      }
    }
  ],
  clientDetails: {
    estimatedDuration: 1,
    instructions: {
      en: ['Please respond to all questions'],
      fr: ['Veuillez répondre à toutes les questions']
    }
  },
  details: {
    description: {
      en: 'This is an example of a multilingual grouped form',
      fr: 'Voici un exemple de formulaire groupé multilingue'
    },
    license: 'Apache-2.0',
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
    firstName: z.string(),
    lastName: z.string(),
    dateOfBirth: z.date(),
    overallHappiness: z.number().int().gte(1).lte(10),
    reasonForSadness: z.string().optional()
  })
});
