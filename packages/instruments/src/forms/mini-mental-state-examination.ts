import { createTranslatedForms } from '..';

const binaryOptions = {
  en: {
    t: 'Correct',
    f: 'Incorrect'
  },
  fr: {
    t: 'Correct',
    f: 'Incorrect'
  }
} as const;

export type MiniMentalStateExaminationData = {
  year: boolean;
  season: boolean;
  month: boolean;
  date: boolean;
  day: boolean;
  country: boolean;
  province: boolean;
  city: boolean;
  institution: boolean;
  floor: boolean;
  learningScore: number;
  spellWorldScore: number;
  recallScore: number;
  canNameWatch: boolean;
  canNamePencil: boolean;
  canRepeatPhrase: boolean;
  canFollowOralInstructions: number;
  canFollowWrittenInstructions: boolean;
  canWriteSentence: boolean;
  canCopyDesign: boolean;
};

export const miniMentalStateExamination = createTranslatedForms<MiniMentalStateExaminationData>({
  name: 'Mini Mental State Examination',
  tags: ['Cognitive'],
  version: 1.0,
  details: {
    estimatedDuration: 10,
    title: {
      en: 'Mini Mental State Examination',
      fr: "Mini-examen de l'état mental"
    },
    description: {
      en: 'The Mini Mental State Examination (MMSE) is a tool that can be used to systematically and thoroughly assess mental status. It is an 11-question measure that tests five areas of cognitive function: orientation, registration, attention and calculation, recall, and language. The maximum score is 30. A score of 23 or lower is indicative of cognitive impairment. The MMSE takes only 5-10 minutes to administer and is therefore practical to use repeatedly and routinely.',
      fr: "Le mini-examen de l'état mental (MMSE) est un outil qui peut être utilisé pour évaluer systématiquement et complètement l'état mental. Il s'agit d'un questionnaire de 11 questions qui teste cinq domaines de la fonction cognitive : l'orientation, l'enregistrement, l'attention et le calcul, la mémorisation et le langage. Le score maximum est de 30. Un score de 23 ou moins indique une déficience cognitive. L'administration du MMSE ne prend que 5 à 10 minutes et il est donc pratique de l'utiliser de manière répétée et routinière."
    },
    instructions: {
      en: [
        "Before the questionnaire is administered, try to get the person to sit down facing you. Assess the person's ability to hear and understand very simple conversation, e.g. What is your name?. If the person uses hearing or visual aids, provide these before starting.",
        "Introduce yourself and try to get the person's confidence. Before you begin, get the person's permission to ask questions, e.g. Would it be alright to ask you the same questions about your memory? This helps to avoid catastrophic reactions.",
        'Ask each question a maximum of three times. If the subject does not respond, score 0.',
        'If the person answers incorrectly, score 0. Accept that answer and do not ask the question again, hint, or provide any physical clues such as head shaking, etc.',
        'The following equipment is required to administer the instrument: a watch, a pencil, and a paper copy of the MMSE.',
        'If the person asks a question, do not explain or engage in conversation. Merely repeat the same directions a maximum of three times.',
        'If the person interrupts (e.g. asking for the purpose of a question), you should reply: "I will explain in a few minutes, when we are finished. Now if we could proceed please. We are almost finished".'
      ],
      fr: [
        "Avant d'administrer le questionnaire, essayez de faire asseoir la personne en face de vous. Évaluez la capacité de la personne à entendre et à comprendre une conversation très simple, par exemple : Quel est votre nom ?. Si la personne utilise des aides auditives ou visuelles, fournissez-les-lui avant de commencer.",
        "Présentez-vous et essayez de mettre la personne en confiance. Avant de commencer, demandez à la personne l'autorisation de poser des questions, par exemple : Est-ce que je peux vous poser les mêmes questions sur votre mémoire ? Cela permet d'éviter les réactions catastrophiques.",
        'Posez chaque question trois fois au maximum. Si le sujet ne répond pas, le score est de 0.',
        "Si la personne répond de manière incorrecte, le score est de 0. Acceptez cette réponse et ne posez pas la question à nouveau, ne faites pas d'allusion et ne donnez pas d'indices physiques tels qu'un mouvement de tête, etc.",
        "Le matériel suivant est nécessaire pour administrer l'instrument : une montre, un crayon et une copie papier du MMSE.",
        "Si la personne pose une question, n'expliquez pas et n'engagez pas la conversation. Répétez simplement les mêmes instructions trois fois au maximum.",
        "Si la personne vous interrompt (par exemple pour demander l'objet d'une question), vous devez répondre : \"Je vous expliquerai dans quelques minutes, lorsque nous aurons terminé. Maintenant, si nous pouvions continuer, s'il vous plaît. Nous avons presque terminé\"."
      ]
    }
  },
  content: [
    {
      title: {
        en: 'Orientation',
        fr: 'Orientation'
      },
      fields: {
        year: {
          kind: 'binary',
          label: {
            en: 'What year is this?',
            fr: 'En quelle année sommes-nous?'
          },
          variant: 'radio',
          options: binaryOptions
        },
        season: {
          kind: 'binary',
          label: {
            en: 'What season is this?',
            fr: 'Quelle est la saison?'
          },
          variant: 'radio',
          options: binaryOptions
        },
        month: {
          kind: 'binary',
          label: {
            en: 'What month is this?',
            fr: 'Quel est le mois?'
          },
          variant: 'radio',
          options: binaryOptions
        },
        date: {
          kind: 'binary',
          label: {
            en: "What is today's date?",
            fr: "Quelle est la date d'aujourd'hui?"
          },
          variant: 'radio',
          options: binaryOptions
        },
        day: {
          kind: 'binary',
          label: {
            en: 'What day of the week is this?',
            fr: 'Quel est le jour de la semaine ?'
          },
          variant: 'radio',
          options: binaryOptions
        },
        country: {
          kind: 'binary',
          label: {
            en: 'What country are we in?',
            fr: 'Dans quel pays sommes-nous?'
          },
          variant: 'radio',
          options: binaryOptions
        },
        province: {
          kind: 'binary',
          label: {
            en: 'What province are we in?',
            fr: 'Dans quelle province sommes-nous?'
          },
          variant: 'radio',
          options: binaryOptions
        },
        city: {
          kind: 'binary',
          label: {
            en: 'What city/town are we in?',
            fr: 'Dans quelle ville sommes-nous?'
          },
          variant: 'radio',
          options: binaryOptions
        },
        institution: {
          kind: 'binary',
          label: {
            en: 'What is the name of this building?',
            fr: 'Quel est le nom de cet édifice?'
          },
          variant: 'radio',
          options: binaryOptions
        },
        floor: {
          kind: 'binary',
          label: {
            en: 'What floor of the building are we on?',
            fr: 'À quel étage sommes-nous?'
          },
          variant: 'radio',
          options: binaryOptions
        }
      }
    },
    {
      title: {
        en: 'Registration',
        fr: 'Apprentissage'
      },
      fields: {
        learningScore: {
          kind: 'numeric',
          label: {
            en: 'Number of words remembered',
            fr: 'Nombre de mots mémorisés'
          },
          variant: 'slider',
          min: 0,
          max: 3
        }
      }
    },
    {
      title: {
        en: 'Attention',
        fr: 'Attention'
      },
      fields: {
        spellWorldScore: {
          kind: 'numeric',
          label: {
            en: 'Spell the word "world" in reverse',
            fr: 'Épelez le mot "monde" à l\'envers'
          },
          variant: 'slider',
          min: 0,
          max: 5
        }
      }
    },
    {
      title: {
        en: 'Recall',
        fr: 'Rappel'
      },
      fields: {
        recallScore: {
          kind: 'numeric',
          label: {
            en: 'Now what were the three objects I asked you to remember?',
            fr: 'Pourriez-vous me dire quels étaient les trois mots que je vous avais demandé de retenir?'
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
        canNameWatch: {
          kind: 'binary',
          label: {
            en: 'Show wristwatch. Ask: What is this called?',
            fr: 'Montrer une montre. Quel est le nom de cet objet ?'
          },
          variant: 'radio',
          options: binaryOptions
        },
        canNamePencil: {
          kind: 'binary',
          label: {
            en: 'Show pencil. Ask: What is this called?',
            fr: 'Montrer un crayon. Quel est le nom de cet objet ?'
          },
          variant: 'radio',
          options: binaryOptions
        },
        canRepeatPhrase: {
          kind: 'binary',
          label: {
            en: 'Say: I would like you to repeat a phrase after me: No ifs, ands or buts',
            fr: 'Répétez cette phrase après moi : Pas de mais, de si, ni de et'
          },
          variant: 'radio',
          options: binaryOptions
        },
        canFollowWrittenInstructions: {
          kind: 'binary',
          label: {
            en: 'Say: Read the words on this page and then do what it says. Then, hand the person the sheet with "CLOSE YOUR EYES" on it.',
            fr: 'Lisez les mots de cette page et faites ce qui est dit. Ensuite, remettez à la personne la feuille sur laquelle est écrit "FERMEZ LES YEUX".'
          },
          variant: 'radio',
          options: binaryOptions
        },
        canWriteSentence: {
          kind: 'binary',
          label: {
            en: 'Hand the person a pencil and paper. Say: Write any complete sentence on that piece of paper.',
            fr: "Donnez à la personne un crayon et une feuille de papier. Dites : Écrivez n'importe quelle phrase complète sur ce morceau de papier."
          },
          variant: 'radio',
          options: binaryOptions
        },
        canFollowOralInstructions: {
          kind: 'numeric',
          label: {
            en: 'Ask the person if he is right or left handed. Take a piece of paper, hold it up in front of the person and say: Take this paper in your right/left hand (whichever is non-dominant), fold the paper in half once with both hands and put the paper down on the floor.',
            fr: "Demandez à la personne si elle est droitière ou gauchère. Prenez une feuille de papier, tenez-la devant la personne et dites : Prenez cette feuille dans votre main droite/gauche (celle qui n'est pas dominante), pliez-la en deux avec vos deux mains : Prenez cette feuille dans votre main droite/gauche (celle qui n'est pas dominante), pliez-la en deux avec vos deux mains et posez-la sur le sol. une fois avec les deux mains et posez le papier sur le sol."
          },
          variant: 'slider',
          min: 0,
          max: 3,
          description: {
            en: 'Score one point for each instruction executed correctly.',
            fr: 'Donnez un point pour chaque instruction exécutée correctement.'
          }
        }
      }
    },
    {
      title: {
        en: 'Visuoconstruction',
        fr: 'Visuoconstruction'
      },
      fields: {
        canCopyDesign: {
          kind: 'binary',
          label: {
            en: 'Place design, eraser and pencil in front of the person. Say: Copy this design please. Allow multiple tries. Wait until the person is finished and hands it back. Score one point for a correctly copied diagram. The person must have drawn a four-sided figure between two five-sided figures',
            fr: 'Pourriez-vous copier ce dessin?'
          },
          variant: 'radio',
          options: binaryOptions
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
        fields: [
          'canCopyDesign',
          'canFollowOralInstructions',
          'canFollowWrittenInstructions',
          'canNamePencil',
          'canNameWatch',
          'canRepeatPhrase',
          'canWriteSentence',
          'city',
          'country',
          'date',
          'day',
          'floor',
          'institution',
          'learningScore',
          'month',
          'province',
          'recallScore',
          'season',
          'spellWorldScore',
          'year'
        ],
        options: {
          coerceBool: true
        }
      }
    }
  },
  validationSchema: {
    type: 'object',
    properties: {
      canCopyDesign: {
        type: 'boolean'
      },
      canFollowOralInstructions: {
        type: 'integer'
      },
      canFollowWrittenInstructions: {
        type: 'boolean'
      },
      canNamePencil: {
        type: 'boolean'
      },
      canNameWatch: {
        type: 'boolean'
      },
      canRepeatPhrase: {
        type: 'boolean'
      },
      canWriteSentence: {
        type: 'boolean'
      },
      city: {
        type: 'boolean'
      },
      country: {
        type: 'boolean'
      },
      date: {
        type: 'boolean'
      },
      day: {
        type: 'boolean'
      },
      floor: {
        type: 'boolean'
      },
      institution: {
        type: 'boolean'
      },
      learningScore: {
        type: 'integer'
      },
      month: {
        type: 'boolean'
      },
      province: {
        type: 'boolean'
      },
      recallScore: {
        type: 'integer'
      },
      season: {
        type: 'boolean'
      },
      spellWorldScore: {
        type: 'integer'
      },
      year: {
        type: 'boolean'
      }
    },
    required: [
      'canCopyDesign',
      'canFollowOralInstructions',
      'canFollowWrittenInstructions',
      'canNamePencil',
      'canNameWatch',
      'canRepeatPhrase',
      'canWriteSentence',
      'city',
      'country',
      'date',
      'day',
      'floor',
      'institution',
      'learningScore',
      'month',
      'province',
      'recallScore',
      'season',
      'spellWorldScore',
      'year'
    ]
  }
});
