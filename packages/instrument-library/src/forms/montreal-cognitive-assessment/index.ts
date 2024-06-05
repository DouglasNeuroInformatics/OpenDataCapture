/* eslint-disable perfectionist/sort-objects */

const { defineInstrument } = await import('/runtime/v1/opendatacapture@1.0.0/core.js');
const { z } = await import('/runtime/v1/zod@3.23.6/index.js');

export default defineInstrument({
  kind: 'FORM',
  language: ['en', 'fr'],

  tags: {
    en: ['Cognitive'],
    fr: ['Cognitif']
  },
  internal: {
    edition: 1,
    name: 'MONTREAL_COGNITIVE_ASSESSMENT_8.1'
  },
  content: {
    abstraction: {
      kind: 'number',
      label: {
        en: 'Abstraction',
        fr: 'Abstraction'
      },
      max: 2,
      min: 0,
      variant: 'input'
    },
    attention: {
      kind: 'number',
      label: {
        en: 'Attention',
        fr: 'Attention'
      },
      max: 6,
      min: 0,
      variant: 'input'
    },
    delayedRecall: {
      kind: 'number',
      label: {
        en: 'Delayed Recall',
        fr: 'Rappel'
      },
      max: 5,
      min: 0,
      variant: 'input'
    },
    language: {
      kind: 'number',
      label: {
        en: 'Language',
        fr: 'Langue'
      },
      max: 3,
      min: 0,
      variant: 'input'
    },
    lowEdu: {
      kind: 'boolean',
      label: {
        en: 'Less Than 12 Years of Education',
        fr: "Moins de 12 ans d'études"
      },
      options: {
        en: {
          false: 'No',
          true: 'Yes'
        },
        fr: {
          false: 'No',
          true: 'Oui'
        }
      },
      variant: 'radio'
    },
    naming: {
      kind: 'number',
      label: {
        en: 'Naming',
        fr: 'Dénomination'
      },
      max: 3,
      min: 0,
      variant: 'input'
    },
    orientation: {
      kind: 'number',
      label: {
        en: 'Orientation',
        fr: 'Orientation'
      },
      max: 6,
      min: 0,
      variant: 'input'
    },
    visuospatialExecutive: {
      kind: 'number',
      label: {
        en: 'Visuospatial/Executive',
        fr: 'Visuospatial/Exécutif'
      },
      max: 5,
      min: 0,
      variant: 'input'
    }
  },
  details: {
    description: {
      en: 'The Montreal Cognitive Assessment (MoCA) was designed as a rapid screening instrument for mild cognitive dysfunction. It assesses different cognitive domains: attention and concentration, executive functions, memory, language, visuoconstructional skills, conceptual thinking, calculations, and orientation. The MoCA may be administered by anyone who understands and follows the instructions, however, only a health professional with expertise in the cognitive field may interpret the results. Time to administer the MoCA is approximately 10 minutes. The total possible score is 30 points; a score of 26 or above is considered normal.',
      fr: "Le Montreal Cognitive Assessment (MoCA) a été conçue comme un instrument de dépistage rapide des troubles cognitifs légers. Il évalue différents domaines cognitifs : l'attention et la concentration, les fonctions exécutives, la mémoire, le langage, les capacités visuoconstructives, la pensée conceptuelle, les calculs et l'orientation. Le MoCA peut être administré par toute personne qui comprend et suit les instructions, mais seul un professionnel de la santé spécialisé dans le domaine cognitif peut interpréter les résultats. L'administration du MoCA dure environ 10 minutes. Le score total possible est de 30 points ; un score de 26 ou plus est considéré comme normal."
    },
    estimatedDuration: 10,
    instructions: {
      en: ['All instructions may be repeated once.'],
      fr: ['Toutes les instructions peuvent être répétées une fois.']
    },
    license: 'UNLICENSED',
    title: {
      en: 'Montreal Cognitive Assessment (v8.1)',
      fr: 'Montreal Cognitive Assessment (v8.1)'
    }
  },
  measures: {
    abstraction: {
      kind: 'const',
      ref: 'abstraction'
    },
    attention: {
      kind: 'const',
      ref: 'attention'
    },
    delayedRecall: {
      kind: 'const',
      ref: 'delayedRecall'
    },
    language: {
      kind: 'const',
      ref: 'language'
    },
    naming: {
      kind: 'const',
      ref: 'naming'
    },
    orientation: {
      kind: 'const',
      ref: 'orientation'
    },
    totalScore: {
      kind: 'computed',
      label: {
        en: 'Total Score',
        fr: 'Score total'
      },
      value: (data) => {
        let sum = 0;
        Object.values(data).forEach((value) => {
          sum += Number(value);
        });
        return sum;
      }
    },
    visuospatialExecutive: {
      kind: 'const',
      ref: 'visuospatialExecutive'
    }
  },
  validationSchema: z.object({
    abstraction: z.number().int().gte(0).lte(2),
    attention: z.number().int().gte(0).lte(6),
    delayedRecall: z.number().int().gte(0).lte(5),
    language: z.number().int().gte(0).lte(3),
    lowEdu: z.boolean(),
    naming: z.number().int().gte(0).lte(3),
    orientation: z.number().int().gte(0).lte(6),
    visuospatialExecutive: z.number().int().gte(0).lte(5)
  })
});
