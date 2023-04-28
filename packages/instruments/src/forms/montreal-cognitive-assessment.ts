import { createTranslatedForms } from '..';

export type MontrealCognitiveAssessmentData = {
  // Visuospatial/Executive
  trailMaking: boolean;
  copyCube: boolean;
  drawClock: number;

  // Naming
  canNameLion: boolean;
  canNameRhino: boolean;
  canNameCamel: boolean;

  // Attention
  readListDigits: number;
  readListLetters: boolean;
  serialSeven: number;

  // Language
  langRepeat: number;
  langFluency: boolean;

  // Abstraction
  abstractionSimilarity: number;

  // Delayed Recall
  uncuedRecall: number;

  // Orientation
  orientationDate: boolean;
  orientationMonth: boolean;
  orientationYear: boolean;
  orientationDay: boolean;
  orientationPlace: boolean;
  orientationCity: boolean;
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
  content: [
    {
      title: {
        en: 'Visuospatial/Executive',
        fr: 'Visuospatial/Exécutif'
      },
      fields: {
        trailMaking: {
          kind: 'binary',
          label: {
            en: 'Alternating Trail Making',
            fr: 'Alternating Trail Making'
          },
          variant: 'radio'
        },
        copyCube: {
          kind: 'binary',
          label: {
            en: 'Visuoconstructional Skills (Cube)',
            fr: 'Compétences visuoconstructives (Cube)'
          },
          variant: 'radio'
        },
        drawClock: {
          kind: 'numeric',
          label: {
            en: 'Visuoconstructional Skills (Clock)',
            fr: 'Compétences visuoconstructives (Horloge)'
          },
          variant: 'slider',
          min: 0,
          max: 3
        }
      }
    },
    {
      title: {
        en: 'Naming',
        fr: 'Dénomination'
      },
      fields: {
        canNameLion: {
          kind: 'binary',
          label: {
            en: 'Lion',
            fr: 'Lion'
          },
          variant: 'radio'
        },
        canNameRhino: {
          kind: 'binary',
          label: {
            en: 'Rhinoceros',
            fr: 'Rhinocéros'
          },
          variant: 'radio'
        },
        canNameCamel: {
          kind: 'binary',
          label: {
            en: 'Camel',
            fr: 'Chameau'
          },
          variant: 'radio'
        }
      }
    },
    {
      title: {
        en: 'Attention',
        fr: 'Attention'
      },
      fields: {
        readListDigits: {
          kind: 'numeric',
          label: {
            en: 'Read list of digits (1 digit/ sec.)',
            fr: "Lecture d'une liste de chiffres (1 chiffre/sec.)"
          },
          variant: 'slider',
          min: 0,
          max: 2
        },
        readListLetters: {
          kind: 'binary',
          label: {
            en: 'Read list of letters. The subject must tap with his hand at each letter A.',
            fr: 'Lisez la liste des lettres. Le sujet doit taper avec sa main sur chaque lettre A.'
          },
          variant: 'radio'
        },
        serialSeven: {
          kind: 'numeric',
          label: {
            en: 'Serial 7 subtraction starting at 100',
            fr: 'Soustraction en série 7 à partir de 100'
          },
          variant: 'slider',
          min: 0,
          max: 3
        }
      }
    },
    {
      title: {
        en: 'Language',
        fr: 'Langue'
      },
      fields: {
        langRepeat: {
          kind: 'numeric',
          label: {
            en: 'Repeat : (1) I only know that John is the one to help today, (2) The cat always hid under the couch when dogs were in the room.',
            fr: "Répéter : (1) L'enfant a promené son chien dans le parc après minuit, (2) L'artiste a terminé sa toile au bon moment pour l'exposition."
          },
          variant: 'slider',
          min: 0,
          max: 2
        },
        langFluency: {
          kind: 'binary',
          label: {
            en: 'Fluency / Name maximum number of words in one minute that begin with the letter F ',
            fr: 'Fluidité du langage. Nommer un maximum de mots commençant par la lettre « T » en 1 min.'
          },
          variant: 'radio'
        }
      }
    },
    {
      title: {
        en: 'Abstraction',
        fr: 'Abstraction'
      },
      fields: {
        abstractionSimilarity: {
          kind: 'numeric',
          label: {
            en: 'Similarity between (e.g., banana - orange = fruit): (1) train - bicycle, (2) watch - ruler',
            fr: 'Similitude entre (ex : banane - orange = fruit): (1) marteau - tournevis, (2) allumette - lampe'
          },
          variant: 'slider',
          min: 0,
          max: 2
        }
      }
    },
    {
      title: {
        en: 'Delayed Recall',
        fr: 'Rappel'
      },
      fields: {
        uncuedRecall: {
          kind: 'numeric',
          label: {
            en: 'Points for UNCUED recall only',
            fr: 'Points pour rappel SANS INDICE seulement'
          },
          variant: 'slider',
          min: 0,
          max: 5
        }
      }
    },
    {
      title: {
        en: 'Orientation',
        fr: 'Orientation'
      },
      fields: {
        orientationDate: {
          kind: 'binary',
          label: {
            en: 'Date',
            fr: 'Date'
          },
          variant: 'radio'
        },
        orientationMonth: {
          kind: 'binary',
          label: {
            en: 'Month',
            fr: 'Moi'
          },
          variant: 'radio'
        },
        orientationYear: {
          kind: 'binary',
          label: {
            en: 'Année',
            fr: 'Year'
          },
          variant: 'radio'
        },
        orientationDay: {
          kind: 'binary',
          label: {
            en: 'Day',
            fr: 'Jour'
          },
          variant: 'radio'
        },
        orientationPlace: {
          kind: 'binary',
          label: {
            en: 'Place',
            fr: 'Endroit'
          },
          variant: 'radio'
        },
        orientationCity: {
          kind: 'binary',
          label: {
            en: 'City',
            fr: 'Ville'
          },
          variant: 'radio'
        }
      }
    }
  ],
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
          'abstractionSimilarity',
          'canNameCamel',
          'canNameLion',
          'canNameRhino',
          'copyCube',
          'drawClock',
          'langFluency',
          'langRepeat',
          'orientationCity',
          'orientationDate',
          'orientationDay',
          'orientationMonth',
          'orientationPlace',
          'orientationYear',
          'readListDigits',
          'readListLetters',
          'serialSeven',
          'trailMaking',
          'uncuedRecall'
        ]
      }
    },
    visuospatialExecutive: {
      label: {
        en: 'Visuospatial/Executive',
        fr: 'Visuospatial/Exécutif'
      },
      formula: {
        kind: 'sum',
        options: {
          coerceBool: true
        },
        fields: ['trailMaking', 'copyCube', 'drawClock']
      }
    },
    naming: {
      label: {
        en: 'Naming',
        fr: 'Dénomination'
      },
      formula: {
        kind: 'sum',
        options: {
          coerceBool: true
        },
        fields: ['canNameLion', 'canNameRhino', 'canNameCamel']
      }
    },
    attention: {
      label: {
        en: 'Attention',
        fr: 'Attention'
      },
      formula: {
        kind: 'sum',
        options: {
          coerceBool: true
        },
        fields: ['readListDigits', 'readListLetters', 'serialSeven']
      }
    },
    language: {
      label: {
        en: 'Language',
        fr: 'Langage'
      },
      formula: {
        kind: 'sum',
        options: {
          coerceBool: true
        },
        fields: ['langRepeat', 'langFluency']
      }
    },
    abstraction: {
      label: {
        en: 'Abstraction',
        fr: 'Abstraction'
      },
      formula: {
        kind: 'const',
        field: 'abstractionSimilarity'
      }
    },
    delayedRecall: {
      label: {
        en: 'Delayed Recall',
        fr: 'Rappel'
      },
      formula: {
        kind: 'const',
        field: 'uncuedRecall'
      }
    },
    orientation: {
      label: {
        en: 'Orientation',
        fr: 'Orientation'
      },
      formula: {
        kind: 'sum',
        options: {
          coerceBool: true
        },
        fields: [
          'orientationDate',
          'orientationMonth',
          'orientationYear',
          'orientationDay',
          'orientationPlace',
          'orientationCity'
        ]
      }
    }
  },
  validationSchema: {
    type: 'object',
    properties: {
      abstractionSimilarity: {
        type: 'integer'
      },
      canNameCamel: {
        type: 'boolean'
      },
      canNameLion: {
        type: 'boolean'
      },
      canNameRhino: {
        type: 'boolean'
      },
      copyCube: {
        type: 'boolean'
      },
      drawClock: {
        type: 'integer'
      },
      langFluency: {
        type: 'boolean'
      },
      langRepeat: {
        type: 'integer'
      },
      orientationCity: {
        type: 'boolean'
      },
      orientationDate: {
        type: 'boolean'
      },
      orientationDay: {
        type: 'boolean'
      },
      orientationMonth: {
        type: 'boolean'
      },
      orientationPlace: {
        type: 'boolean'
      },
      orientationYear: {
        type: 'boolean'
      },
      readListDigits: {
        type: 'integer'
      },
      readListLetters: {
        type: 'boolean'
      },
      serialSeven: {
        type: 'integer'
      },
      trailMaking: {
        type: 'boolean'
      },
      uncuedRecall: {
        type: 'integer'
      }
    },
    required: [
      'abstractionSimilarity',
      'canNameCamel',
      'canNameLion',
      'canNameRhino',
      'copyCube',
      'drawClock',
      'langFluency',
      'langRepeat',
      'orientationCity',
      'orientationDate',
      'orientationDay',
      'orientationMonth',
      'orientationPlace',
      'orientationYear',
      'readListDigits',
      'readListLetters',
      'serialSeven',
      'trailMaking',
      'uncuedRecall'
    ]
  }
});
