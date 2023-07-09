import { createTranslatedForms } from '../utils/create-translated-forms.js';

export type MontrealCognitiveAssessmentData = {
  visuospatialExecutive: number;
  naming: number;
  attention: number;
  language: number;
  abstraction: number;
  delayedRecall: number;
  orientation: number;
  lowEdu: boolean;
};

export const montrealCognitiveAssessment = createTranslatedForms<MontrealCognitiveAssessmentData>({
  name: 'MontrealCognitiveAssessment',
  tags: ['Cognitive'],
  version: 8.1,
  details: {
    estimatedDuration: 10,
    title: {
      en: 'Montreal Cognitive Assessment',
      fr: 'Montreal Cognitive Assessment'
    },
    description: {
      en: 'The Montreal Cognitive Assessment (MoCA) was designed as a rapid screening instrument for mild cognitive dysfunction. It assesses different cognitive domains: attention and concentration, executive functions, memory, language, visuoconstructional skills, conceptual thinking, calculations, and orientation. The MoCA may be administered by anyone who understands and follows the instructions, however, only a health professional with expertise in the cognitive field may interpret the results. Time to administer the MoCA is approximately 10 minutes. The total possible score is 30 points; a score of 26 or above is considered normal.',
      fr: "Le Montreal Cognitive Assessment (MoCA) a été conçue comme un instrument de dépistage rapide des troubles cognitifs légers. Il évalue différents domaines cognitifs : l'attention et la concentration, les fonctions exécutives, la mémoire, le langage, les capacités visuoconstructives, la pensée conceptuelle, les calculs et l'orientation. Le MoCA peut être administré par toute personne qui comprend et suit les instructions, mais seul un professionnel de la santé spécialisé dans le domaine cognitif peut interpréter les résultats. L'administration du MoCA dure environ 10 minutes. Le score total possible est de 30 points ; un score de 26 ou plus est considéré comme normal."
    },
    instructions: {
      en: 'All instructions may be repeated once.',
      fr: 'Toutes les instructions peuvent être répétées une fois.'
    }
  },
  content: {
    visuospatialExecutive: {
      kind: 'numeric',
      label: {
        en: 'Visuospatial/Executive',
        fr: 'Visuospatial/Exécutif'
      },
      variant: 'default',
      min: 0,
      max: 5
    },
    naming: {
      kind: 'numeric',
      label: {
        en: 'Naming',
        fr: 'Dénomination'
      },
      variant: 'default',
      min: 0,
      max: 3
    },
    attention: {
      kind: 'numeric',
      label: {
        en: 'Attention',
        fr: 'Attention'
      },
      variant: 'default',
      min: 0,
      max: 6
    },
    language: {
      kind: 'numeric',
      label: {
        en: 'Language',
        fr: 'Langue'
      },
      variant: 'default',
      min: 0,
      max: 3
    },
    abstraction: {
      kind: 'numeric',
      label: {
        en: 'Abstraction',
        fr: 'Abstraction'
      },
      variant: 'default',
      min: 0,
      max: 2
    },
    delayedRecall: {
      kind: 'numeric',
      label: {
        en: 'Delayed Recall',
        fr: 'Rappel'
      },
      variant: 'default',
      min: 0,
      max: 5
    },
    orientation: {
      kind: 'numeric',
      label: {
        en: 'Orientation',
        fr: 'Orientation'
      },
      variant: 'default',
      min: 0,
      max: 6
    },
    lowEdu: {
      kind: 'binary',
      label: {
        en: 'Less Than 12 Years of Education',
        fr: "Moins de 12 ans d'études"
      },
      variant: 'radio',
      options: {
        en: {
          t: 'Yes',
          f: 'No'
        },
        fr: {
          t: 'Oui',
          f: 'No'
        }
      }
    }
  },
  measures: {
    totalScore: {
      label: {
        en: 'Total Score',
        fr: 'Score total'
      },
      formula: {
        kind: 'sum',
        options: {
          coerceBool: true
        },
        fields: [
          'abstraction',
          'attention',
          'delayedRecall',
          'language',
          'lowEdu',
          'naming',
          'orientation',
          'visuospatialExecutive'
        ]
      }
    },
    visuospatialExecutive: {
      label: {
        en: 'Visuospatial/Executive',
        fr: 'Visuospatial/Exécutif'
      },
      formula: {
        kind: 'const',
        field: 'visuospatialExecutive'
      }
    },
    naming: {
      label: {
        en: 'Naming',
        fr: 'Dénomination'
      },
      formula: {
        kind: 'const',
        field: 'naming'
      }
    },
    attention: {
      label: {
        en: 'Attention',
        fr: 'Attention'
      },
      formula: {
        kind: 'const',
        field: 'attention'
      }
    },
    language: {
      label: {
        en: 'Language',
        fr: 'Langue'
      },
      formula: {
        kind: 'const',
        field: 'language'
      }
    },
    abstraction: {
      label: {
        en: 'Abstraction',
        fr: 'Abstraction'
      },
      formula: {
        kind: 'const',
        field: 'abstraction'
      }
    },
    delayedRecall: {
      label: {
        en: 'Delayed Recall',
        fr: 'Rappel'
      },
      formula: {
        kind: 'const',
        field: 'delayedRecall'
      }
    },
    orientation: {
      label: {
        en: 'Orientation',
        fr: 'Orientation'
      },
      formula: {
        kind: 'const',
        field: 'orientation'
      }
    }
  },
  validationSchema: {
    type: 'object',
    properties: {
      visuospatialExecutive: {
        type: 'integer',
        minimum: 0,
        maximum: 5
      },
      naming: {
        type: 'integer',
        minimum: 0,
        maximum: 3
      },
      attention: {
        type: 'integer',
        minimum: 0,
        maximum: 6
      },
      language: {
        type: 'integer',
        minimum: 0,
        maximum: 3
      },
      abstraction: {
        type: 'integer',
        minimum: 0,
        maximum: 2
      },
      delayedRecall: {
        type: 'integer',
        minimum: 0,
        maximum: 5
      },
      orientation: {
        type: 'integer',
        minimum: 0,
        maximum: 6
      },
      lowEdu: {
        type: 'boolean'
      }
    },
    required: [
      'abstraction',
      'attention',
      'delayedRecall',
      'language',
      'naming',
      'orientation',
      'visuospatialExecutive'
    ]
  }
});
