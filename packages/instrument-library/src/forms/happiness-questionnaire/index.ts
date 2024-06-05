/* eslint-disable perfectionist/sort-objects */

const { pick, sum } = await import('/runtime/v1/lodash-es@4.17.21/index.js');
const { defineInstrument } = await import('/runtime/v1/opendatacapture@1.0.0/core.js');
const { z } = await import('/runtime/v1/zod@3.23.6/index.js');

export default defineInstrument({
  kind: 'FORM',
  language: ['en', 'fr'],
  name: 'HAPPINESS_QUESTIONNAIRE',
  tags: {
    en: ['Well-Being'],
    fr: ['Bien-être']
  },
  edition: 1,
  content: {
    personalLifeSatisfaction: {
      description: {
        en: 'Please select a number from 1 to 10 (inclusive), where 1 is very dissatisfied and 10 is very satisfied.',
        fr: 'Veuillez choisir un chiffre de 1 à 10 (inclus), où 1 correspond à très insatisfait et 10 à très satisfait.'
      },
      kind: 'number',
      label: {
        en: 'How satisfied are you with your personal life?',
        fr: 'Dans quelle mesure êtes-vous satisfait de votre vie personnelle ?'
      },
      max: 10,
      min: 1,
      variant: 'slider'
    },
    professionalLifeSatisfaction: {
      description: {
        en: 'Please select a number from 1 to 10 (inclusive), where 1 is very dissatisfied and 10 is very satisfied.',
        fr: 'Veuillez choisir un chiffre de 1 à 10 (inclus), où 1 correspond à très insatisfait et 10 à très satisfait.'
      },
      kind: 'number',
      label: {
        en: 'How satisfied are you with your professional life?',
        fr: 'Dans quelle mesure êtes-vous satisfait de votre vie professionnelle ?'
      },
      max: 10,
      min: 1,
      variant: 'slider'
    },
    isSatisfiedOverall: {
      kind: 'boolean',
      label: {
        en: 'Overall, would you say you are satisfied with your life?',
        fr: "Dans l'ensemble, diriez-vous que vous êtes satisfait de votre vie ?"
      },
      options: {
        en: {
          true: 'Yes',
          false: 'No'
        },
        fr: {
          true: 'Oui',
          false: 'Non'
        }
      },
      variant: 'radio'
    },
    reasonNotSatisfied: {
      deps: ['isSatisfiedOverall'],
      kind: 'dynamic',
      render: (data) => {
        if (data.isSatisfiedOverall !== false) {
          return null;
        }
        return {
          label: {
            en: 'Why do you feel dissatisfied with your life?',
            fr: 'Pourquoi vous sentez-vous insatisfait de votre vie ?'
          },
          isRequired: false,
          kind: 'string',
          variant: 'textarea'
        };
      }
    },
    causesOfDissatisfaction: {
      deps: ['isSatisfiedOverall'],
      kind: 'dynamic',
      render: (data) => {
        if (data.isSatisfiedOverall !== false) {
          return null;
        }
        return {
          label: {
            en: 'Which of the following are causes of your dissatisfaction? ',
            fr: "Parmi les causes suivantes, lesquelles sont à l'origine de votre insatisfaction ? "
          },
          isRequired: false,
          kind: 'set',
          variant: 'listbox',
          options: {
            en: {
              EXISTENTIAL_CRISIS: 'Existential Crisis',
              FRIENDS: 'Friends',
              ROMANTIC_PARTNER: 'Romantic Partner',
              MONEY: 'Money'
            },
            fr: {
              EXISTENTIAL_CRISIS: 'Crise existentielle',
              FRIENDS: 'Amis',
              ROMANTIC_PARTNER: 'Partenaire romantique',
              MONEY: "L'argent"
            }
          }
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
      en: ['Please answer the questions based on your current feelings.'],
      fr: ['Veuillez répondre àux questions en fonction de vos sentiments actuels.']
    },
    license: 'AGPL-3.0',
    title: {
      en: 'Happiness Questionnaire',
      fr: 'Questionnaire sur le bonheur'
    }
  },
  measures: {
    personalLifeSatisfaction: {
      kind: 'const',
      ref: 'personalLifeSatisfaction',
      label: {
        en: 'Satisfaction With Personal Life',
        fr: "Satisfaction à l'égard de la vie personnelle"
      }
    },
    professionalLifeSatisfaction: {
      kind: 'const',
      ref: 'professionalLifeSatisfaction',
      label: {
        en: 'Satisfaction With Professional Life',
        fr: "Satisfaction à l'égard de la vie professionnelle"
      }
    },
    overallLifeSatisfaction: {
      kind: 'computed',
      label: {
        en: 'Overall Satisfaction Score',
        fr: 'Score global de satisfaction'
      },
      value(data) {
        return sum(Object.values(pick(data, ['personalLifeSatisfaction', 'professionalLifeSatisfaction'])));
      }
    }
  },
  validationSchema: z
    .object({
      personalLifeSatisfaction: z.number().int().gte(1).lte(10),
      professionalLifeSatisfaction: z.number().int().gte(1).lte(10),
      isSatisfiedOverall: z.boolean(),
      reasonNotSatisfied: z.string().optional(),
      causesOfDissatisfaction: z.set(z.enum(['MONEY', 'FRIENDS', 'ROMANTIC_PARTNER', 'EXISTENTIAL_CRISIS'])).optional()
    })
    .superRefine((arg, ctx) => {
      if (!arg.isSatisfiedOverall && !arg.reasonNotSatisfied) {
        ctx.addIssue({
          code: 'custom',
          message: 'This field is required / Ce champ est obligatoire'
        });
      }
    })
});
