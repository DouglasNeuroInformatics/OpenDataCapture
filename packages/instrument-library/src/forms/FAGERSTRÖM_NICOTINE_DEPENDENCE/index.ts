import { defineInstrument } from '/runtime/v1/@opendatacapture/runtime-core';
import { sum } from '/runtime/v1/lodash-es@4.x';
import { z } from '/runtime/v1/zod@3.x';

const yesNoOptions = {
  en: {
    1: 'Yes',
    0: 'No'
  },
  fr: {
    1: 'Oui',
    0: 'Non'
  }
};

export default defineInstrument({
  kind: 'FORM',
  language: ['en', 'fr'],
  internal: {
    name: 'FAGERSTRÖM_NICOTINE_DEPENDENCE',
    edition: 1
  },
  tags: {
    en: ['smoking', 'addiction', 'nicotine'],
    fr: ['fumer', 'dépendance', 'nicotine']
  },
  details: {
    description: {
      en: 'The Fagerström Test for Nicotine Dependence is a standard instrument for assessing the intensity of physical addiction to nicotine. The test was designed to provide an ordinal measure of nicotine dependence related to cigarette smoking. It contains six items that evaluate the quantity of cigarette consumption, the compulsion to use, and dependence.',
      fr: "Le test de Fagerström pour la dépendance à la nicotine est un instrument standard pour évaluer l'intensité de la dépendance physique à la nicotine. Le test a été conçu pour fournir une mesure ordinale de la dépendance à la nicotine liée au tabagisme. Il contient six items qui évaluent la quantité de cigarettes consommées, la compulsion à consommer et la dépendance."
    },
    estimatedDuration: 5,
    instructions: {
      en: ['Please respond to every question'],
      fr: ['Veuillez répondre à toutes les questions']
    },
    license: 'PUBLIC-DOMAIN',
    title: {
      en: 'Fagerström Nicotine Dependence (FTND)',
      fr: 'Fagerström test de dépendance à la nicotine (FTND)'
    }
  },

  content: {
    smokeTime: {
      disableAutoPrefix: true,
      kind: 'number',
      label: {
        en: '1. How soon after waking do you smoke your first cigarette?',
        fr: '1. Combien de temps après le réveil fumez-vous votre première cigarette?'
      },
      options: {
        en: {
          3: 'Within 5 minutes',
          2: '6-30 minutes',
          1: '31-60 minutes',
          0: 'More than 60 minutes'
        },
        fr: {
          3: 'Dans les 5 minutes',
          2: '6 à 30 minutes',
          1: '31 à 60 minutes ',
          0: 'Plus de 60 minutes'
        }
      },
      variant: 'radio'
    },
    difficultToRefrainSmoking: {
      disableAutoPrefix: true,
      kind: 'number',
      label: {
        en: '2. Do you find it difficult to refrain from smoking in places where it is forbidden? e.g., Church, Library, etc.',
        fr: "2. Trouvez-vous qu'il est difficile de vous abstenir de fumer dans les endroits où c'est interdit, tels le métro, le cinéma, l'hôpital, les restaurants?"
      },
      options: yesNoOptions,
      variant: 'radio'
    },
    cigaretteHateToGiveup: {
      disableAutoPrefix: true,
      kind: 'number',
      label: {
        en: '3. Which cigarette would you hate to give up?',
        fr: '3. À quelle cigarette renonceriez-vous le plus difficilement?'
      },
      options: {
        en: {
          1: 'The first in the morning',
          0: 'Any other'
        },
        fr: {
          1: 'La première du matin',
          0: 'À une autre'
        }
      },
      variant: 'radio'
    },
    cigaretteAmount: {
      disableAutoPrefix: true,
      kind: 'number',
      label: {
        en: '4. How many cigarettes a do you smoke?',
        fr: '4. Combien de cigarettes fumez-vous par jour?'
      },
      options: {
        en: {
          0: '10 or less',
          1: '11 - 20',
          2: '21 - 30',
          3: '31 or more'
        },
        fr: {
          0: '10 ou moins',
          1: '11 à 20',
          2: '21 à 30',
          3: '31 ou plus 3'
        }
      },
      variant: 'radio'
    },
    smokeMoreInMorning: {
      disableAutoPrefix: true,
      kind: 'number',
      label: {
        en: '5. Do you smoke more frequently in the morning?',
        fr: '5. Fumez-vous à intervalles plus rapprochés durant les premières heures de la matinée que durant le reste de la journée?'
      },
      options: yesNoOptions,
      variant: 'radio'
    },
    smokeWhileSickInBed: {
      disableAutoPrefix: true,
      kind: 'number',
      label: {
        en: '6. Do you smoke even if you are sick in bed most of the day?',
        fr: '6. Fumez-vous lorsque vous êtes malade au point de devoir rester au lit presque toute la journée?'
      },
      options: yesNoOptions,
      variant: 'radio'
    }
  },
  measures: {
    auditCScore: {
      kind: 'computed',
      label: {
        en: 'Total Score:',
        fr: 'Score total:'
      },
      value: (data) => {
        return sum(Object.values(data));
      }
    }
  },
  validationSchema: z.object({
    smokeTime: z.number().int().min(0).max(3),
    difficultToRefrainSmoking: z.number().int().min(0).max(1),
    cigaretteHateToGiveup: z.number().int().min(0).max(1),
    cigaretteAmount: z.number().int().min(0).max(3),
    smokeMoreInMorning: z.number().int().min(0).max(1),
    smokeWhileSickInBed: z.number().int().min(0).max(1)
  })
});
