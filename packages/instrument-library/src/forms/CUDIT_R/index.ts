import { defineInstrument } from '/runtime/v1/@opendatacapture/runtime-core';
import { z } from '/runtime/v1/zod@3.x';

const $NumberRange = z.number().int().min(0).max(4);

const $InstrumentData = z
  .object({
    isCannabisUsed: z.boolean(),
    cannabisFrequency: $NumberRange.optional(),
    stonedTime: $NumberRange.optional(),
    unableToStopUsage: $NumberRange.optional(),
    cannabisInducedFailure: $NumberRange.optional(),
    cannabisRelatedUsageTime: $NumberRange.optional(),
    cannabisMemoryConcentration: $NumberRange.optional(),
    cannabisHazards: $NumberRange.optional(),
    cannabisReduction: $NumberRange.optional()
  })
  .refine(({ isCannabisUsed, ...data }) => {
    if (!isCannabisUsed) {
      return true;
    }
    // in case in the future you can deselect options
    return Object.values(data).length === 8 && Object.values(data).every((arg) => typeof arg === 'number');
  }, 'Error: Please fill out all the questions / Erreur: Veuillez répondre à toutes les questions');

function createDependentField<const T>(field: T) {
  return {
    kind: 'dynamic' as const,
    deps: ['isCannabisUsed'] as const,
    render: (data: { isCannabisUsed?: unknown }) => {
      if (data.isCannabisUsed === true) {
        return field;
      }
      return null;
    }
  };
}

const calculateCannabisUse = (data: { [key: string]: unknown }) => {
  let sum = 0;
  for (const key in data) {
    const value = data[key as keyof typeof data];
    if (typeof value === 'number') {
      sum += value;
    }
  }
  return sum;
};

export default defineInstrument({
  kind: 'FORM',
  language: ['en', 'fr'],
  tags: {
    en: ['Cannabis', 'Addiction', 'Substance Abuse'],
    fr: ['Cannabis', 'Dépendance', 'Abus de substance']
  },
  internal: {
    edition: 1,
    name: 'CUDIT_R'
  },
  clientDetails: {
    estimatedDuration: 10,
    instructions: {
      en: ['Please fill out answer that best describe your cannabis usage.'],
      fr: ['Veuillez remplir les réponses qui décrivent le mieux votre consommation de cannabis']
    },
    title: {
      en: 'Cannabis Use Disorder Identification Test - Revised (CUDIT-R)',
      fr: 'Teste de consommation du Cannabis (CUDIT-R)'
    }
  },
  details: {
    description: {
      en: 'The CUDIT-R is an 8-item screening tool used to assess problematic cannabis use and identify individuals at risk of Cannabis Use Disorder (CUD). A score of 8 or higher suggests hazardous use, warranting further assessment or intervention.',
      fr: 'Le CUDIT-R est un outil de dépistage en 8 points utilisé pour évaluer la consommation problématique de cannabis et identifier les personnes présentant un risque de trouble lié à la consommation de cannabis (TCC). Un score de 8 ou plus indique une consommation dangereuse, justifiant une évaluation ou une intervention plus poussée.'
    },
    license: 'PUBLIC-DOMAIN',
    title: {
      en: 'Cannabis Use Disorder Identification Test - Revised (CUDIT-R)',
      fr: "Test d'identification des troubles liés à l'usage du cannabis - version révisée (CUDIT-R)"
    }
  },
  content: {
    isCannabisUsed: {
      kind: 'boolean',
      label: {
        en: 'Have you used any cannabis over the past six months?',
        fr: 'Avez-vous consommé du cannabis au cours des 6 derniers mois?'
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
    cannabisFrequency: createDependentField({
      kind: 'number',
      label: {
        en: '1. How often do you use Cannabis?',
        fr: '1. A quelle fréquence tu consomme du Cannabis?'
      },
      options: {
        en: {
          0: 'Never',
          1: 'Monthly or less',
          2: '2-4 times a month',
          3: '2-3 times a week',
          4: '4 or more times a week'
        },
        fr: {
          0: 'Jamais',
          1: '≤ 1 fois/mois',
          2: '2 à 4 fois/mois',
          3: '2 à 3 fois/semaine',
          4: 'Plus que 4 fois/semaine'
        }
      },
      variant: 'radio'
    }),
    stonedTime: createDependentField({
      kind: 'number',
      label: {
        en: '2. How many hours were you "stoned" on a typical day when you were using cannabis?',
        fr: "2. Combien d'heures êtes-vous « défoncé » un jour typique où vous consommez du cannabis??"
      },
      options: {
        en: {
          0: 'Less than 1',
          1: '1 or 2',
          2: '3 or 4',
          3: '5 or 6',
          4: '7 or more'
        },
        fr: {
          0: 'Moins de 1h',
          1: '1 ou 2h',
          2: '3 ou 4h',
          3: '5 ou 6h',
          4: '7h ou plus'
        }
      },
      variant: 'radio'
    }),
    unableToStopUsage: createDependentField({
      kind: 'number',
      label: {
        en: '3. How often during the past 6 months did you find that you were not able to stop using cannabis once you had started?',
        fr: "3. Au cours des 6 derniers mois, à quelle fréquence avez-vous constaté que vous n'étiez plus capable de vous arrêter de fumer du cannabis une fois que vous aviez commencé?"
      },
      options: {
        en: {
          0: 'Never',
          1: 'Less than monthly',
          2: 'Monthly',
          3: 'Weekly',
          4: 'Daily or almost daily'
        },
        fr: {
          0: 'Jamais',
          1: 'Moins que 1 fois/mois',
          2: '2 à 4 fois/mois',
          3: '2 à 3 fois/semaine',
          4: 'Plus que 4 fois/semaine'
        }
      },
      variant: 'radio'
    }),
    cannabisInducedFailure: createDependentField({
      kind: 'number',
      label: {
        en: '4. How often during the past 6 months did you fail to do what was normally expected from you because of using cannabis?',
        fr: '4. Au cours des 6 derniers mois, combien de fois votre consommation de cannabis vous a-t-elle empêché de faire ce qui était normalement attendu de vous?'
      },
      options: {
        en: {
          0: 'Never',
          1: 'Less than monthly',
          2: 'Monthly',
          3: 'Weekly',
          4: 'Daily or almost daily'
        },
        fr: {
          0: 'Jamais',
          1: 'Moins que 1 fois/mois',
          2: '2 à 4 fois/mois',
          3: '2 à 3 fois/semaine',
          4: 'Plus que 4 fois/semaine'
        }
      },
      variant: 'radio'
    }),
    cannabisRelatedUsageTime: createDependentField({
      kind: 'number',
      label: {
        en: '5. How often in the past 6 months have you devoted a great deal of your time to getting, using, or recovering from cannabis?',
        fr: '5. Au cours des 6 derniers mois, combien de fois avez-vous passé une grande partie de votre temps à chercher à vous procurer ou consommer du cannabis, ou à vous remettre des effets du cannabis ?'
      },
      options: {
        en: {
          0: 'Never',
          1: 'Less than monthly',
          2: 'Monthly',
          3: 'Weekly',
          4: 'Daily or almost daily'
        },
        fr: {
          0: 'Jamais',
          1: 'Moins que 1 fois/mois',
          2: '2 à 4 fois/mois',
          3: '2 à 3 fois/semaine',
          4: 'Plus que 4 fois/semaine'
        }
      },
      variant: 'radio'
    }),
    cannabisMemoryConcentration: createDependentField({
      kind: 'number',
      label: {
        en: '6. How often in the past 6 months have you had a problem with your memory or concentration after using cannabis?',
        fr: '6. Au cours des 6 derniers mois, combien de fois avez-vous éprouvé des problèmes de mémoire ou de concentration après avoir fumé du cannabis?'
      },
      options: {
        en: {
          0: 'Never',
          1: 'Less than monthly',
          2: 'Monthly',
          3: 'Weekly',
          4: 'Daily or almost daily'
        },
        fr: {
          0: 'Jamais',
          1: 'moins que 1fois/mois',
          2: '2 à 4 fois/mois',
          3: '2 à 3 fois/semaine',
          4: 'plus que 4 fois/semaine'
        }
      },
      variant: 'radio'
    }),
    cannabisHazards: createDependentField({
      kind: 'number',
      label: {
        en: '7. How often do you use cannabis in situations that could be physically hazardous, such as driving, operating machinery, or caring for children:',
        fr: "7. A quelle fréquence consommez-vous du cannabis dans des situations qui pourraient entrainer un danger, par exemple conduire un véhicule, utiliser une machine, ou s'occuper d'enfants?"
      },
      options: {
        en: {
          0: 'Never',
          1: 'Less than monthly',
          2: 'Monthly',
          3: 'Weekly',
          4: 'Daily or almost daily'
        },
        fr: {
          0: 'Jamais',
          1: 'Moins que 1 fois/mois',
          2: '2 à 4 fois/mois',
          3: '2 à 3 fois/semaine',
          4: 'Plus que 4 fois/semaine'
        }
      },
      variant: 'radio'
    }),
    cannabisReduction: createDependentField({
      kind: 'number',
      label: {
        en: '8. Have you ever thought about cutting down, or stopping, your use of cannabis?',
        fr: "8. Avez-vous déjà envisagé de réduire ou d'arrêter votre consommation de cannabis ?"
      },
      options: {
        en: {
          0: 'Never',
          2: 'Yes but not in the past 6 months',
          4: 'Monthly'
        },
        fr: {
          0: 'Jamais',
          2: 'Oui, mais pas au cours des 6 derniers mois',
          4: 'Oui, au cours des 6 derniers mois'
        }
      },
      variant: 'radio'
    })
  },
  validationSchema: $InstrumentData,
  measures: {
    cannabisFrequency: {
      kind: 'const',
      label: {
        en: 'Cannabis Frequency',
        fr: 'Frequence de cosommation du Cannabis'
      },
      ref: 'cannabisFrequency'
    },
    stonedTime: {
      kind: 'const',
      label: {
        en: 'Time "Stoned"',
        fr: 'Temps « défoncé »'
      },
      ref: 'stonedTime'
    },
    unableToStopUsage: {
      kind: 'const',
      label: {
        en: 'Usage Reduction',
        fr: 'Reduction du Cosummation'
      },
      ref: 'unableToStopUsage'
    },
    cannabisInducedFailure: {
      kind: 'const',
      label: {
        en: 'Cannabis induced failure',
        fr: 'Défaillance à cause du cannabis'
      },
      ref: 'cannabisInducedFailure'
    },
    cannabisRelatedUsageTime: {
      kind: 'const',
      label: {
        en: 'Cannabis usage time',
        fr: 'Temp de cosommation du Cannabis'
      },
      ref: 'cannabisRelatedUsageTime'
    },
    cannabisMemoryConcentration: {
      kind: 'const',
      label: {
        en: 'Memory and Concentration',
        fr: 'la memoire et la concentration'
      },
      ref: 'cannabisMemoryConcentration'
    },
    cannabisHazards: {
      kind: 'const',
      label: {
        en: 'Cannabis Hazard Score',
        fr: 'Score de dangerosité du cannabis'
      },
      ref: 'cannabisHazards'
    },
    cannabisReduction: {
      kind: 'const',
      label: {
        en: 'Cannabis Reduction',
        fr: 'Reduction de la consommation du cannabis'
      },
      ref: 'cannabisReduction'
    },
    cannabisScore: {
      kind: 'computed',
      hidden: true,
      label: {
        en: 'Cannabis use score',
        fr: 'Score de consommation de cannabis'
      },
      value: (data) => {
        return calculateCannabisUse(data);
      }
    },
    cannabisScoreInterpretation: {
      kind: 'computed',
      hidden: true,
      label: {
        en: 'Cannabis use score interpretation',
        fr: 'Score de consommation de interprétation'
      },
      value: (data) => {
        const score = calculateCannabisUse(data);
        if (score >= 8 && score < 12) {
          return 'Hazardous cannabis use / Consommation dangereuse de cannabis';
        } else if (score >= 12) {
          return "Possible cannabis use disorder / Un trouble de l'usage du cannabis est probable";
        }
        return;
      }
    }
  }
});
