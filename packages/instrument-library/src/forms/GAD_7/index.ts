import { defineInstrument } from '/runtime/v1/@opendatacapture/runtime-core';
import { z } from '/runtime/v1/zod@3.x';

const likertOptions = {
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
};

const calculateGAD7total = (data: { [key: string]: unknown }) => {
  let sum = 0;
  for (const key in data) {
    const value = data[key as keyof typeof data];
    if (typeof value === 'number' && key != 'difficultyCoping') {
      sum += value;
    }
  }
  return sum;
};

export default defineInstrument({
  details: {
    title: {
      en: 'Generalized Anxiety Disorder-7 (GAD-7)',
      fr: "Trouble d'anxiété générale-7 (GAD-7)"
    },
    description: {
      en: 'The Generalized Anxiety Disorder 7 (GAD-7) is a self-reported questionnaire for screening and severity measuring of generalized anxiety disorder (GAD). The GAD7 asks for self-reported anxiety symptoms over the past two weeks.',
      fr: "Le trouble d'anxiété généralisée 7 (GAD-7) est un questionnaire autodéclaré pour le dépistage et la mesure de la gravité du trouble d'anxiété généralisée (TAG). Le GAD7 demande les symptômes d’anxiété autodéclarés au cours des deux dernières semaines."
    },
    estimatedDuration: 1,
    instructions: {
      en: ['Please complete all questions'],
      fr: ['Veuillez répondre à toutes les questions']
    },
    license: 'PUBLIC-DOMAIN'
  },
  kind: 'FORM',
  language: ['en', 'fr'],
  tags: {
    en: ['Anxiety'],
    fr: ['Anxiété']
  },
  internal: {
    name: 'GAD_7',
    edition: 1
  },
  content: [
    {
      title: {
        en: 'Over the last two weeks, how often have you been bothered by the following problems?',
        fr: 'Au cours des 14 derniers jours, à quelle fréquence avez-vous été dérangé(e) par les problèmes suivants?'
      },
      fields: {
        nervousAnxiousOnEdge: {
          description: {
            en: 'Over the last two weeks, how often have you been bothered by feeling nervous, anxious, or on edge?',
            fr: "Au cours des 14 derniers jours, à quelle fréquence avez-vous été dérangé(e) par sentiment de nervosité, d'anxiété ou de tension?"
          },
          label: {
            en: 'Feeling nervous, anxious, or on edge',
            fr: "Sentiment de nervosité, d'anxiété ou de tension"
          },
          kind: 'number',
          options: likertOptions,
          variant: 'radio'
        },
        noStopControlWorrying: {
          description: {
            en: 'Over the last two weeks, how often have you been bothered by not being able to stop or control worrying?',
            fr: "Au cours des 14 derniers jours, à quelle fréquence avez-vous été dérangé(e) par incapable d'arrêter de vous inquiéter ou de contrôler vos inquiétudes?"
          },
          label: {
            en: 'Not being able to stop or control worrying',
            fr: "Incapable d'arrêter de vous inquiéter ou de contrôler vos inquiétudes"
          },
          kind: 'number',
          options: likertOptions,
          variant: 'radio'
        },
        worryingTooMuch: {
          description: {
            en: 'Over the last two weeks, how often have you been bothered by worrying too much about different things?',
            fr: 'Au cours des 14 derniers jours, à quelle fréquence avez-vous été dérangé(e) par inquiétudes excessives à propos de tout et de rien?'
          },
          label: {
            en: 'Worrying too much about different things',
            fr: 'Inquiétudes excessives à propos de tout et de rien'
          },
          kind: 'number',
          options: likertOptions,
          variant: 'radio'
        },
        troubleRelaxing: {
          description: {
            en: 'Over the last two weeks, how often have you had trouble relaxing?',
            fr: 'Au cours des deux dernières semaines, à quelle fréquence avez-vous eu du mal à vous détendre?'
          },
          label: {
            en: 'Have trouble relaxing',
            fr: 'Difficulté à se détendre'
          },
          kind: 'number',
          options: likertOptions,
          variant: 'radio'
        },
        restless: {
          description: {
            en: 'Over the last two weeks, how often have you been bothered by being so restless that it is hard to sit still?',
            fr: "Au cours des 14 derniers jours, à quelle fréquence avez-vous été dérangé(e) par agitation telle qu'il est difficile de rester tranquille?"
          },
          label: {
            en: 'Being so restless that it is hard to sit still',
            fr: "Agitation telle qu'il est difficile de rester tranquille"
          },
          kind: 'number',
          options: likertOptions,
          variant: 'radio'
        },
        easilyAnnoyedIrritable: {
          description: {
            en: 'Over the last two weeks, how often have you been bothered by becoming easily annoyed or irritable?',
            fr: 'Au cours des 14 derniers jours, à quelle fréquence avez-vous été dérangé(e) par devenir facilement contrarié(e) ou irritable?'
          },
          label: {
            en: 'Becoming easily annoyed or irritable',
            fr: 'Devenir facilement contrarié(e) ou irritable'
          },
          kind: 'number',
          options: likertOptions,
          variant: 'radio'
        },
        afraidSomethingAwful: {
          description: {
            en: 'Over the last two weeks, how often have you been bothered by feeling afraid, as if something awful might happen?',
            fr: "Au cours des 14 derniers jours, à quelle fréquence avez-vous été dérangé(e) par avoir peur que quelque chose d'épouvantable puisse arriver?"
          },
          label: {
            en: 'Feeling afraid, as if something awful might happen',
            fr: "Avoir peur que quelque chose d'épouvantable puisse arriver"
          },
          kind: 'number',
          options: likertOptions,
          variant: 'radio'
        }
      }
    },
    {
      title: {
        en: ' ',
        fr: 'Difficulté à faire face'
      },
      fields: {
        difficultyCoping: {
          kind: 'dynamic',
          deps: [
            'nervousAnxiousOnEdge',
            'noStopControlWorrying',
            'worryingTooMuch',
            'troubleRelaxing',
            'restless',
            'easilyAnnoyedIrritable',
            'afraidSomethingAwful'
          ],
          render(data) {
            if (
              !(
                data?.nervousAnxiousOnEdge ||
                data?.noStopControlWorrying ||
                data?.worryingTooMuch ||
                data?.troubleRelaxing ||
                data?.restless ||
                data?.easilyAnnoyedIrritable ||
                data?.afraidSomethingAwful
              )
            ) {
              return null;
            }
            return {
              description: {
                en: 'Given your problems selected above, how difficult have they made it for you to do your work, take care of things at home, or get along with other people?',
                fr: 'Compte tenu des problèmes sélectionnés ci-dessus, dans quelle mesure ceux-ci rendus plus difficile votre travail, vous occuper de vos affaires à la maison ou vous entendre avec les autres personnes?'
              },
              label: {
                en: 'Given your problems selected above, how difficult have they made it for you to do your work, take care of things at home, or get along with other people?',
                fr: 'Compte tenu des problèmes sélectionnés ci-dessus, dans quelle mesure ceux-ci rendus plus difficile votre travail, vous occuper de vos affaires à la maison ou vous entendre avec les autres personnes?'
              },
              kind: 'number',
              options: {
                en: {
                  0: 'Not difficult at all',
                  1: 'Somewhat difficult',
                  2: 'Very difficult',
                  3: 'Extremely difficult'
                },
                fr: {
                  0: 'Pas difficile',
                  1: 'Un peu difficile',
                  2: 'Très difficile',
                  3: 'Extrêmement difficile'
                }
              },
              variant: 'radio'
            };
          }
        }
      }
    }
  ],
  measures: {
    nervousAnxiousOnEdge: {
      kind: 'const',
      ref: 'nervousAnxiousOnEdge'
    },
    noStopControlWorrying: {
      kind: 'const',
      ref: 'noStopControlWorrying'
    },
    worryingTooMuch: {
      kind: 'const',
      ref: 'worryingTooMuch'
    },
    troubleRelaxing: {
      kind: 'const',
      ref: 'troubleRelaxing'
    },
    restless: {
      kind: 'const',
      ref: 'restless'
    },
    easilyAnnoyedIrritable: {
      kind: 'const',
      ref: 'easilyAnnoyedIrritable'
    },
    afraidSomethingAwful: {
      kind: 'const',
      ref: 'afraidSomethingAwful'
    },
    difficultyCoping: {
      kind: 'const',
      ref: 'difficultyCoping'
    },
    gad7Total: {
      kind: 'computed',
      label: {
        en: 'Total of GAD7',
        fr: ''
      },
      value: (data) => {
        return calculateGAD7total(data);
      }
    }
  },
  validationSchema: z.object({
    nervousAnxiousOnEdge: z.number().int().min(0).max(3),
    noStopControlWorrying: z.number().int().min(0).max(3),
    worryingTooMuch: z.number().int().min(0).max(3),
    troubleRelaxing: z.number().int().min(0).max(3),
    restless: z.number().int().min(0).max(3),
    easilyAnnoyedIrritable: z.number().int().min(0).max(3),
    afraidSomethingAwful: z.number().int().min(0).max(3),
    difficultyCoping: z.number().int().min(0).max(3).optional()
  })
});
