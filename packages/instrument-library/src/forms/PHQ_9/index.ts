import { defineInstrument } from '/runtime/v1/@opendatacapture/runtime-core';
import { omit, sum } from '/runtime/v1/lodash-es@4.x';
import { z } from '/runtime/v1/zod@3.x';

const $Response = z.number().int().min(0).max(3);

export default defineInstrument({
  kind: 'FORM',
  language: ['en', 'fr'],
  tags: {
    en: ['Health', 'Depression'],
    fr: ['Santé', 'Dépression']
  },
  internal: {
    edition: 1,
    name: 'PHQ_9'
  },
  content: [
    {
      title: {
        en: 'Summary of Instructions',
        fr: 'Résumé des instructions'
      },
      description: {
        en: 'Over the last 2 weeks, how often have you been bothered by any of the following problems?',
        fr: 'Au cours des deux dernières semaines, à quelle fréquence avez-vous été dérangé(e) par les problèmes suivants?'
      },
      fields: {
        questions: {
          kind: 'number-record',
          label: {
            en: 'Questions',
            fr: 'Questions'
          },
          items: {
            interestPleasure: {
              label: {
                en: '1. Little interest or pleasure in doing things',
                fr: "1. Peu d'intérêt ou de plaisir à faire des choses"
              }
            },
            feelingDown: {
              label: {
                en: '2. Feeling down, depressed, or hopeless',
                fr: '2. Se sentir triste, déprimé(e) ou désespéré(e)'
              }
            },
            sleepIssues: {
              label: {
                en: '3. Trouble falling or staying asleep, or sleeping too much',
                fr: "3. Difficultés à s'endormir ou à rester endormi(e), ou trop dormir"
              }
            },
            energyLevel: {
              label: {
                en: '4. Feeling tired or having little energy',
                fr: "4. Se sentir fatigué(e) ou avoir peu d'énergie"
              }
            },
            appetiteChanges: {
              label: {
                en: '5. Poor appetite or overeating',
                fr: "5. Peu d'appétit ou trop manger"
              }
            },
            selfWorth: {
              label: {
                en: '6. Feeling bad about yourself — or that you are a failure or have let yourself or your family down',
                fr: "6. Mauvaise perception de vous-même — ou vous pensez que vous êtes un perdant ou que vous n'avez pas satisfait vos propres attentes ou celles de votre famille"
              }
            },
            concentrationIssues: {
              label: {
                en: '7. Trouble concentrating on things, such as reading the newspaper or watching television',
                fr: '7. Difficultés à se concentrer sur des choses telles que lire le journal ou regarder la télévision'
              }
            },
            psychomotorChanges: {
              label: {
                en: '8. Moving or speaking so slowly that other people could have noticed? Or the opposite — being so fidgety or restless that you have been moving around a lot more than usual',
                fr: "8. Vous bougez ou parlez si lentement que les autres personnes ont pu le remarquer. Ou au contraire — vous êtes si agité(e) que vous bougez beaucoup plus que d'habitude"
              }
            },
            suicidalThoughts: {
              label: {
                en: '9. Thoughts that you would be better off dead or of hurting yourself in some way',
                fr: "9. Vous avez pensé que vous seriez mieux mort(e) ou pensé à vous blesser d'une façon ou d'une autre"
              }
            }
          },
          options: {
            en: {
              0: 'Not at All',
              1: 'Several Days',
              2: 'More than half the days',
              3: 'Nearly every day'
            },
            fr: {
              0: 'Jamais',
              1: 'Plusieurs jours',
              2: 'Plus de la moitié des jours',
              3: 'Presque tous les jours'
            }
          },
          variant: 'likert'
        },
        impactOnFunctioning: {
          kind: 'dynamic',
          deps: ['questions'],
          render: (data) => {
            if (!data.questions || sum(Object.values(data.questions)) === 0) {
              return null;
            }
            return {
              disableAutoPrefix: true,
              kind: 'number',
              label: {
                en: 'How difficult have these problems made it for you to do your work, take care of things at home, or get along with other people?',
                fr: 'Dans quelle mesure ce(s) problème(s) a-t-il (ont-ils) rendu difficile(s) votre travail, vos tâches à la maison ou votre capacité à bien vous entendre avec les autres?'
              },
              options: {
                en: {
                  0: 'Not difficult at all',
                  1: 'Somewhat difficult',
                  2: 'Very difficult',
                  3: 'Extremely difficult'
                },
                fr: {
                  0: 'Pas du tout difficile(s)',
                  1: 'Plutôt difficile(s)',
                  2: 'Très difficile(s)',
                  3: 'Extrêmement difficile(s)'
                }
              },
              variant: 'select'
            };
          }
        }
      }
    }
  ],
  clientDetails: {
    estimatedDuration: 1,
    instructions: {
      en: [
        "Before beginning this test, please ensure you are in a a quiet place where you can focus without distractions. You will answer 9 questions about how you've been feeling over the past 2 weeks. Answer each question as honestly as possible based on your feelings and experiences."
      ],
      fr: [
        "Avant de commencer ce test, assurez-vous d'être dans un endroit calme où vous pourrez vous concentrer sans distraction. Vous allez répondre à 9 questions sur ce que vous avez ressenti au cours des deux dernières semaines. Répondez à chaque question le plus honnêtement possible, en vous basant sur vos sentiments et vos expériences."
      ]
    }
  },
  details: {
    description: {
      en: 'The Patient Health Questionnaire (PHQ) is a diagnostic tool for mental health disorders used by health care professionals that is quick and easy for patients to complete. In the mid-1990s, Robert L. Spitzer, MD, Janet B.W. Williams, DSW, and Kurt Kroenke, MD, and colleagues at Columbia University developed the Primary Care Evaluation of Mental Disorders (PRIME-MD), a diagnostic tool containing modules on 12 different mental health disorders. They worked in collaboration with researchers at the Regenstrief Institute at Indiana University and with the support of an educational grant from Pfizer Inc. During the development of PRIME-MD, Drs. Spitzer, Williams and Kroenke, created the PHQ and GAD-7 screeners. The PHQ-9, a tool specific to depression, simply scores each of the 9 DSM-IV criteria based on the mood module from the original PRIME-MD.',
      fr: "Le questionnaire sur la santé du patient (PHQ) est un outil de diagnostic des troubles mentaux utilisé par les professionnels de la santé, rapide et facile à remplir par les patients. Au milieu des années 1990, Robert L. Spitzer, MD, Janet B.W. Williams, DSW, et Kurt Kroenke, MD, et leurs collègues de Columbia University ont mis au point le Primary Care Evaluation of Mental Disorders (PRIME-MD), un outil de diagnostic contenant des modules sur 12 troubles mentaux différents. Ils ont travaillé en collaboration avec des chercheurs de l'Institut Regenstrief d'Indiana University et avec le soutien d'une bourse éducative de Pfizer Inc. Au cours du développement de PRIME-MD, les docteurs Spitzer, Williams et Kroenke ont créé les screeners PHQ et GAD-7. Le PHQ-9, un outil spécifique à la dépression, évalue simplement chacun des 9 critères du DSM-IV en se basant sur le module de l'humeur de PRIME-MD."
    },

    license: 'PUBLIC-DOMAIN',
    title: {
      en: 'Patient Health Questionnaire (PHQ-9)',
      fr: 'Questionnaire sur la santé du patient (PHQ-9)'
    }
  },
  measures: {
    interestPleasure: {
      kind: 'computed',
      label: {
        en: 'Little Interest/Pleasure',
        fr: "Peu d'intérêt/plaisir"
      },
      value: ({ questions }) => questions.interestPleasure
    },
    feelingDown: {
      kind: 'computed',
      label: { en: 'Feeling Down/Depressed', fr: 'Se sentir déprimé/triste' },
      value: ({ questions }) => questions.feelingDown
    },
    sleepIssues: {
      kind: 'computed',
      label: { en: 'Sleep Issues', fr: 'Problèmes de sommeil' },
      value: ({ questions }) => questions.sleepIssues
    },
    energyLevel: {
      kind: 'computed',
      label: { en: 'Low Energy', fr: 'Faible énergie' },
      value: ({ questions }) => questions.energyLevel
    },
    appetiteChanges: {
      kind: 'computed',
      label: { en: 'Appetite Changes', fr: "Changements d'appétit" },
      value: ({ questions }) => questions.appetiteChanges
    },
    selfWorth: {
      kind: 'computed',
      label: { en: 'Low Self-Worth', fr: 'Faible estime de soi' },
      value: ({ questions }) => questions.selfWorth
    },
    concentrationIssues: {
      kind: 'computed',
      label: { en: 'Concentration Issues', fr: 'Problèmes de concentration' },
      value: ({ questions }) => questions.concentrationIssues
    },
    psychomotorChanges: {
      kind: 'computed',
      label: { en: 'Psychomotor Changes', fr: 'Changements psychomoteurs' },
      value: ({ questions }) => questions.psychomotorChanges
    },
    suicidalThoughts: {
      kind: 'computed',
      label: { en: 'Suicidal Thoughts', fr: 'Pensées suicidaires' },
      value: ({ questions }) => questions.suicidalThoughts
    },
    impactOnFunctioning: {
      kind: 'computed',
      label: { en: 'Impact on Functioning', fr: 'Impact sur le fonctionnement' },
      value: ({ impactOnFunctioning }) => impactOnFunctioning
    },
    totalScore: {
      kind: 'computed',
      label: { en: 'Total Score', fr: 'Score total' },
      value: ({ questions }) => sum(Object.values(omit(questions, 'impactOnFunctioning')))
    }
  },
  validationSchema: z
    .object({
      questions: z.object({
        interestPleasure: $Response,
        feelingDown: $Response,
        sleepIssues: $Response,
        energyLevel: $Response,
        appetiteChanges: $Response,
        selfWorth: $Response,
        concentrationIssues: $Response,
        psychomotorChanges: $Response,
        suicidalThoughts: $Response
      }),
      impactOnFunctioning: $Response.optional()
    })
    .superRefine(({ impactOnFunctioning, questions }, ctx) => {
      const isAnyNonZero = sum(Object.values(questions)) > 0;
      // If any response is not zero, then impactOnFunctioning is required
      if (isAnyNonZero && impactOnFunctioning === undefined) {
        ctx.addIssue({
          code: 'custom',
          message: 'This question is required / Cette question est obligatoire',
          path: ['impactOnFunctioning']
        });
      }
    })
});
