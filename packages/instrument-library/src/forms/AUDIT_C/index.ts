import { defineInstrument } from '/runtime/v1/@opendatacapture/runtime-core';
import { sum } from '/runtime/v1/lodash-es@4.x';
import { z } from '/runtime/v1/zod@3.x';

export default defineInstrument({
  kind: 'FORM',
  language: ['en', 'fr'],
  internal: {
    name: 'AUDIT_C',
    edition: 1
  },
  tags: {
    en: ['Alcohol', 'Health', 'Disorder'],
    fr: ['Alcool', 'Santé', 'Troubles']
  },
  clientDetails: {
    title: {
      en: 'Alcohol Use (AUDIT-C)',
      fr: "Consommation d'alcool (AUDIT-C)"
    }
  },
  details: {
    description: {
      en: 'The Alcohol Use Disorders Identification Test (AUDIT-C) is an alcohol screen that can help identify patients who are hazardous drinkers or have active alcohol use disorders (including alcohol abuse or dependence).',
      fr: "Le test d'identification des troubles liés à la consommation d'alcool (AUDIT-C) est un test de dépistage de l'alcool qui permet d'identifier les patients qui sont des buveurs dangereux ou qui présentent des troubles liés à la consommation d'alcool (y compris l'abus d'alcool ou la dépendance)."
    },
    estimatedDuration: 2,
    instructions: {
      en: ['Please respond to every question'],
      fr: ['Veuillez répondre à toutes les questions']
    },
    license: 'PUBLIC-DOMAIN',
    title: {
      en: 'Alcohol Use Disorders Identification Test (AUDIT-C)',
      fr: "Test d'identification des troubles liés à l'utilisation de l'alcool (AUDIT-C)"
    }
  },
  content: {
    drinkingFrequency: {
      kind: 'number',
      label: {
        en: '1. How often do you have a drink containing alcohol?',
        fr: "1. A quelle fréquence vous arrive-t-il de consommer des boissons contenant de l'alcool?"
      },
      options: {
        en: {
          0: 'Never',
          1: 'Monthly or Less',
          2: '2 to 4 times a month',
          3: '2 to 3 times a week',
          4: '4 or more times a week'
        },
        fr: {
          0: 'Jamais',
          1: 'Une fois par mois ou moins',
          2: '2 à 4 fois par mois',
          3: '2 à 3 fois par semaine',
          4: '4 fois ou plus par semaine'
        }
      },
      variant: 'radio'
    },
    typicalDrinkQuantity: {
      kind: 'number',
      label: {
        en: '2. How many drinks containing alcohol do you have on a typical day when you are drinking?',
        fr: "2. Combien de verres standards buvez-vous au cours d'une journée ordinaire où vous buvez de l'alcool?"
      },
      options: {
        en: {
          0: '1 or 2',
          1: '3 or 4',
          2: '5 or 6',
          3: '7 to 9',
          4: '10 or more'
        },
        fr: {
          0: '1 ou 2',
          1: '3 ou 4',
          2: '5 ou 6',
          3: '7 ou 9',
          4: '10 ou plus'
        }
      },
      variant: 'radio'
    },
    bingeDrinkingFrequency: {
      kind: 'number',
      label: {
        en: '3. How often do you have six or more drinks on one occasion?',
        fr: "3. Au cours d'une même occasion, à quelle fréquence vous arrive-t-il de boire six verres standard ou plus?"
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
          1: "Moins d'une fois par mois",
          2: 'Une fois  par mois',
          3: 'Une fois par semaine',
          4: 'Chaque jour ou presque'
        }
      },
      variant: 'radio'
    }
  },
  measures: {
    auditCScore: {
      kind: 'computed',
      label: {
        en: 'Total Score',
        fr: 'Score total'
      },
      value: (data) => {
        return sum(Object.values(data));
      }
    }
  },
  validationSchema: z.object({
    drinkingFrequency: z.number().int().min(0).max(4),
    typicalDrinkQuantity: z.number().int().min(0).max(4),
    bingeDrinkingFrequency: z.number().int().min(0).max(4)
  })
});
