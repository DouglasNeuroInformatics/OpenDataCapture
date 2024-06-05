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
    name: 'MINI_MENTAL_STATE_EXAMINATION'
  },
  content: [
    {
      fields: {
        date: {
          description: {
            en: 'Accept previous or next date',
            fr: 'Accepter la date précédente ou suivante'
          },
          kind: 'number',
          label: {
            en: "What is today's date?",
            fr: "Quelle est la date d'aujourd'hui ?"
          },
          max: 1,
          min: 0,
          variant: 'input'
        },
        day: {
          description: {
            en: 'Accept exact answer only',
            fr: "N'accepter que les réponses exactes"
          },
          kind: 'number',
          label: {
            en: 'What day of the week is this?',
            fr: 'Quel jour de la semaine sommes-nous ?'
          },
          max: 1,
          min: 0,
          variant: 'input'
        },
        month: {
          description: {
            en: 'Accept either: the first day of a new month or the last day of the previous month',
            fr: "Accepter soit : le premier jour d'un nouveau mois, soit le dernier jour du mois précédent"
          },
          kind: 'number',
          label: {
            en: 'What month is this?',
            fr: 'Quel mois sommes-nous ?'
          },
          max: 1,
          min: 0,
          variant: 'input'
        },
        season: {
          description: {
            en: 'Accept either the last week of the old season or the first week of a new season',
            fr: "accepter soit : la dernière semaine de l'ancienne saison, soit la première semaine d'une nouvelle saison"
          },
          kind: 'number',
          label: {
            en: 'What season is this?',
            fr: "De quelle saison s'agit-il ?"
          },
          max: 1,
          min: 0,
          variant: 'input'
        },
        year: {
          description: {
            en: 'Accept exact answer only',
            fr: "N'accepter que les réponses exactes"
          },
          kind: 'number',
          label: {
            en: 'What year is this?',
            fr: "De quelle année s'agit-il ?"
          },
          max: 1,
          min: 0,
          variant: 'input'
        }
      },
      title: {
        en: 'Time: 10 seconds for each reply',
        fr: 'Durée : 10 secondes pour chaque réponse'
      }
    },
    {
      fields: {
        city: {
          description: {
            en: 'Accept exact answer only',
            fr: "N'accepter que la réponse exacte"
          },
          kind: 'number',
          label: {
            en: 'What city/town are we in?',
            fr: 'Dans quelle ville nous trouvons-nous ?'
          },
          max: 1,
          min: 0,
          variant: 'input'
        },
        country: {
          description: {
            en: 'Accept exact answer only',
            fr: "N'accepter que les réponses exactes"
          },
          kind: 'number',
          label: {
            en: 'What country are we in?',
            fr: 'Dans quel pays nous trouvons-nous ?'
          },
          max: 1,
          min: 0,
          variant: 'input'
        },
        floor: {
          description: {
            en: 'Accept exact answer only',
            fr: "N'accepter que la réponse exacte"
          },
          kind: 'number',
          label: {
            en: 'What floor of the building are we on?',
            fr: 'A quel étage du bâtiment nous trouvons-nous ?'
          },
          max: 1,
          min: 0,
          variant: 'input'
        },
        institution: {
          description: {
            en: 'Accept exact name of institution only',
            fr: "N'accepter que le nom exact de l'institution"
          },
          kind: 'number',
          label: {
            en: 'What is the name of this building?',
            fr: 'Quel est le nom de ce bâtiment ?'
          },
          max: 1,
          min: 0,
          variant: 'input'
        },
        province: {
          description: {
            en: 'Accept exact answer only',
            fr: "N'accepter que les réponses exactes"
          },
          kind: 'number',
          label: {
            en: 'What province are we in?',
            fr: 'Dans quelle province nous trouvons-nous ?'
          },
          max: 1,
          min: 0,
          variant: 'input'
        }
      },
      title: {
        en: 'Time: 10 seconds for each reply',
        fr: 'Durée : 10 secondes pour chaque réponse'
      }
    },
    {
      description: {
        en: 'Say: I am going to name three objects. When I am finished, I want you to repeat them. Remember what they are because I am going to ask you to name them again in a few minutes. Say the following words slowly at approximately one-second intervals: Ball / Car / Man.',
        fr: "Dites : Je vais nommer trois objets. Quand j'aurai fini, je veux que vous les répétiez. Souvenez-vous de ce que c'est parce que je vais vous demander de les nommer à nouveau dans quelques minutes. Dites les mots suivants lentement à environ une seconde d'intervalle : Balle / Voiture / Homme."
      },
      fields: {
        learningScore: {
          kind: 'number',
          label: {
            en: 'Learning Score',
            fr: "Score d'apprentissage"
          },
          max: 3,
          min: 0,
          variant: 'input'
        }
      },
      title: {
        en: 'Time: 20 seconds',
        fr: 'Durée : 20 secondes'
      }
    },
    {
      description: {
        en: 'Spell the word WORLD (you may help the person to spell the word correctly). Say: Now spell it backwards please. If the subject cannot spell world even with assistance, score 0.',
        fr: "Épellez le mot MONDE (vous pouvez aider la personne à épeler le mot correctement). Dites : Maintenant, épellez-le à l'envers, s'il vous plaît. Si le sujet ne peut pas épeler monde même avec de l'aide, marquez 0."
      },
      fields: {
        spellWorldScore: {
          kind: 'number',
          label: {
            en: 'Spelling Score',
            fr: "Score d'orthographe"
          },
          max: 5,
          min: 0,
          variant: 'input'
        }
      },
      title: {
        en: 'Time: 30 seconds',
        fr: 'Durée : 30 secondes'
      }
    },
    {
      description: {
        en: 'Say: Now what were the three objects I asked you to remember? (score one point for each correct answer regardless of order).',
        fr: "Dites : Maintenant, quels sont les trois objets dont je vous ai demandé de vous souvenir ? (marquez un point pour chaque réponse correcte, quel que soit l'ordre)."
      },
      fields: {
        recallScore: {
          kind: 'number',
          label: {
            en: 'Recall Score',
            fr: 'Score de rappel'
          },
          max: 3,
          min: 0,
          variant: 'input'
        }
      },
      title: {
        en: 'Time: 10 seconds',
        fr: 'Time: 10 seconds'
      }
    },
    {
      description: {
        en: 'Show wristwatch. Ask: What is this called? (score one point for correct response, e.g., accept “wristwatch” or “watch”, but do not accept “clock” or “time”).',
        fr: 'Montrer la montre-bracelet. Demandez : Quel est le nom de cet objet ? (marquez un point pour une réponse correcte, par exemple, acceptez "montre-bracelet" ou "montre", mais n\'acceptez pas "horloge" ou "heure").'
      },
      fields: {
        canNameWatch: {
          kind: 'number',
          label: {
            en: 'Name Watch Score',
            fr: 'Peut nommer une montre'
          },
          max: 1,
          min: 0,
          variant: 'input'
        }
      },
      title: {
        en: 'Time: 10 seconds',
        fr: 'Durée : 10 secondes'
      }
    },
    {
      description: {
        en: 'Show pencil. Ask: What is this called?',
        fr: 'Montrer un crayon. Quel est le nom de cet objet ?'
      },
      fields: {
        canNamePencil: {
          kind: 'number',
          label: {
            en: 'Name Pencil Score',
            fr: 'Peut nommer un crayon'
          },
          max: 1,
          min: 0,
          variant: 'input'
        }
      },
      title: {
        en: 'Time: 10 seconds',
        fr: 'Durée : 10 secondes'
      }
    },
    {
      description: {
        en: 'Say: I would like you to repeat a phrase after me: No ifs, ands or buts',
        fr: 'Dites : Je voudrais que vous répétiez une phrase après moi : Pas de si, ni de et, ni de mais'
      },
      fields: {
        canRepeatPhrase: {
          kind: 'number',
          label: {
            en: 'Repeat Phrase Score',
            fr: 'Peut répéter une phrase'
          },
          max: 1,
          min: 0,
          variant: 'input'
        }
      },
      title: {
        en: 'Time: 10 seconds',
        fr: 'Durée : 10 secondes'
      }
    },
    {
      description: {
        en: 'Say: Read the words on this page and then do what it says. Then, hand the person the sheet with CLOSE YOUR EYES on it. If the subject just reads and does not close eyes, you may repeat: read the words on this page and then do what it says, (a maximum of three times). Score one point only if the subject closes eyes. The subject does not have to read aloud.',
        fr: "Dites : Lisez les mots de cette page et faites ce qui est écrit. Ensuite, remettez à la personne la feuille sur laquelle est écrit FERMEZ LES YEUX. Si le sujet se contente de lire et ne ferme pas les yeux, vous pouvez répéter : lisez les mots de cette page et faites ce qui est écrit (trois fois au maximum). Ne marquez qu'un point si le sujet ferme les yeux. Le sujet n'est pas obligé de lire à haute voix."
      },
      fields: {
        canFollowWrittenInstructions: {
          kind: 'number',
          label: {
            en: 'Follow Written Instructions Score',
            fr: 'Peut suivre des instructions écrites'
          },
          max: 1,
          min: 0,
          variant: 'input'
        }
      },
      title: {
        en: 'Time: 10 seconds',
        fr: 'Durée : 10 secondes'
      }
    },
    {
      description: {
        en: 'Hand the person a pencil and paper. Say: Write any complete sentence on that piece of paper. Score one point. The sentence must make sense. Ignore spelling errors.',
        fr: "Donnez à la personne un crayon et du papier. Dites : Écrivez une phrase complète sur ce morceau de papier. Marquez un point. La phrase doit avoir un sens. Ne tenez pas compte des fautes d'orthographe."
      },
      fields: {
        canWriteSentence: {
          kind: 'number',
          label: {
            en: 'Write Sentence Score',
            fr: 'Peut écrire une phrase'
          },
          max: 1,
          min: 0,
          variant: 'input'
        }
      },
      title: {
        en: 'Time: 30 seconds',
        fr: 'Durée : 30 secondes'
      }
    },
    {
      description: {
        en: 'Place design, eraser and pencil in front of the person. Say: Copy this design please. Allow multiple tries. Wait until the person is finished and hands it back. Score one point for a correctly copied diagram. The person must have drawn a four-sided figure between two five-sided figures.',
        fr: "Placez le dessin, la gomme et le crayon devant la personne. Dites : Copiez ce dessin, s'il vous plaît. Permettez plusieurs essais. Attendez que la personne ait terminé et rende le dessin. Marquez un point pour un diagramme correctement copié. La personne doit avoir dessiné une figure à quatre côtés entre deux figures à cinq côtés."
      },
      fields: {
        canCopyDesign: {
          kind: 'number',
          label: {
            en: 'Copy Design Score',
            fr: 'Peut copier le dessin'
          },
          max: 1,
          min: 0,
          variant: 'input'
        }
      },
      title: {
        en: 'Time: 1 minute maximum',
        fr: 'Durée : 1 minute maximum'
      }
    },
    {
      description: {
        en: 'Ask the person if he is right or left handed. Take a piece of paper, hold it up in front of the person and say: Take this paper in your right/left hand (whichever is non-dominant), fold the paper in half once with both hands and put the paper down on the floor.',
        fr: "Demandez à la personne si elle est droitière ou gauchère. Prenez une feuille de papier, tenez-la devant la personne et dites : Prenez cette feuille dans votre main droite/gauche (celle qui n'est pas dominante), pliez-la en deux avec vos deux mains : Prenez cette feuille dans votre main droite/gauche (celle qui n'est pas dominante), pliez-la en deux avec vos deux mains et posez-la sur le sol. une fois avec les deux mains et posez le papier sur le sol."
      },
      fields: {
        canFollowOralInstructions: {
          description: {
            en: 'Score one point for each instruction executed correctly.',
            fr: 'Donnez un point pour chaque instruction exécutée correctement.'
          },
          kind: 'number',
          label: {
            en: 'Follow Oral Instructions Score',
            fr: 'Peut suivre des instructions orales'
          },
          max: 3,
          min: 0,
          variant: 'input'
        }
      },
      title: {
        en: 'Time: 30 seconds',
        fr: 'Durée : 30 secondes'
      }
    }
  ],
  details: {
    description: {
      en: 'The Mini Mental State Examination (MMSE) is a tool that can be used to systematically and thoroughly assess mental status. It is an 11-question measure that tests five areas of cognitive function: orientation, registration, attention and calculation, recall, and language. The maximum score is 30. A score of 23 or lower is indicative of cognitive impairment. The MMSE takes only 5-10 minutes to administer and is therefore practical to use repeatedly and routinely.',
      fr: "Le mini-examen de l'état mental (MMSE) est un outil qui peut être utilisé pour évaluer systématiquement et complètement l'état mental. Il s'agit d'un questionnaire de 11 questions qui teste cinq domaines de la fonction cognitive : l'orientation, l'enregistrement, l'attention et le calcul, la mémorisation et le langage. Le score maximum est de 30. Un score de 23 ou moins indique une déficience cognitive. L'administration du MMSE ne prend que 5 à 10 minutes et il est donc pratique de l'utiliser de manière répétée et routinière."
    },
    estimatedDuration: 10,
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
    },
    license: 'UNLICENSED',
    title: {
      en: 'Mini Mental State Examination',
      fr: "Mini-examen de l'état mental"
    }
  },
  measures: {
    totalScore: {
      kind: 'computed',
      label: {
        en: 'Total Score',
        fr: 'Score total'
      },
      value: (data) => {
        let sum = 0;
        Object.values(data).forEach((value) => {
          sum += value;
        });
        return sum;
      }
    }
  },
  validationSchema: z.object({
    canCopyDesign: z.number().int().gte(0).lte(1),
    canFollowOralInstructions: z.number().int().gte(0).lte(3),
    canFollowWrittenInstructions: z.number().int().gte(0).lte(1),
    canNamePencil: z.number().int().gte(0).lte(1),
    canNameWatch: z.number().int().gte(0).lte(1),
    canRepeatPhrase: z.number().int().gte(0).lte(1),
    canWriteSentence: z.number().int().gte(0).lte(1),
    city: z.number().int().gte(0).lte(1),
    country: z.number().int().gte(0).lte(1),
    date: z.number().int().gte(0).lte(1),
    day: z.number().int().gte(0).lte(1),
    floor: z.number().int().gte(0).lte(1),
    institution: z.number().int().gte(0).lte(1),
    learningScore: z.number().int().gte(0).lte(3),
    month: z.number().int().gte(0).lte(1),
    province: z.number().int().gte(0).lte(1),
    recallScore: z.number().int().gte(0).lte(3),
    season: z.number().int().gte(0).lte(1),
    spellWorldScore: z.number().int().gte(0).lte(5),
    year: z.number().int().gte(0).lte(1)
  })
});
