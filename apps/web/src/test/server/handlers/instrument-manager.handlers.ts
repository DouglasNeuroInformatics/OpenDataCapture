import { HttpResponse, http } from 'msw';

export const ManageInstrumentHandlers = [
  http.get('/v1/instruments/summaries', () => {
    return HttpResponse.json([
      {
        details: {
          authors: [],
          description: {
            en: 'The Happiness Questionnaire is a questionnaire about happiness.',
            fr: 'Le questionnaire sur le bonheur est un questionnaire sur le bonheur.'
          },
          estimatedDuration: 1,
          instructions: {
            en: ['Please answer the question based on your current feelings.'],
            fr: ['Veuillez répondre à la question en fonction de vos sentiments actuels.']
          },
          license: 'AGPL-3.0',
          referenceUrl: null,
          sourceUrl: null,
          title: {
            en: 'Happiness Questionnaire',
            fr: 'Questionnaire sur le bonheur'
          }
        },
        id: '65dd26a1933b24c8b9023ca1',
        kind: 'FORM',
        language: ['en', 'fr'],
        name: 'HappinessQuestionnaire',
        tags: {
          en: ['Well-Being'],
          fr: ['Bien-être']
        },
        version: 1
      },
      {
        details: {
          authors: [],
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
          referenceUrl: null,
          sourceUrl: null,
          title: {
            en: 'Montreal Cognitive Assessment',
            fr: 'Montreal Cognitive Assessment'
          }
        },
        id: '65dd26ad933b24c8b9023ca7',
        kind: 'FORM',
        language: ['en', 'fr'],
        name: 'MontrealCognitiveAssessment',
        tags: {
          en: ['Cognitive'],
          fr: ['Cognitif']
        },
        version: 8.1
      },
      {
        details: {
          authors: [],
          description:
            '\n      The Brief Psychiatric Rating Scale is a rating scale which a clinician or researcher may use to\n      measure psychiatric symptoms such as depression, anxiety, hallucinations and unusual behavior.\n      The scale is one of the oldest, most widely used scales to measure psychotic symptoms and was\n      first published in 1962.',
          estimatedDuration: 30,
          instructions: [
            "Please enter the score for the term which best describes the patient's condition.",
            '0 = not assessed, 1 = not present, 2 = very mild, 3 = mild, 4 = moderate, 5 = moderately severe, 6 = severe, 7 = extremely severe.'
          ],
          license: 'UNLICENSED',
          referenceUrl: null,
          sourceUrl: null,
          title: 'Brief Psychiatric Rating Scale'
        },
        id: '65dd26ad933b24c8b9023ca6',
        kind: 'FORM',
        language: 'en',
        name: 'BriefPsychiatricRatingScale',
        tags: ['Schizophrenia', 'Psychosis'],
        version: 1
      },
      {
        details: {
          authors: [],
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
          referenceUrl: null,
          sourceUrl: null,
          title: {
            en: 'Mini Mental State Examination',
            fr: "Mini-examen de l'état mental"
          }
        },
        id: '65dd26ad933b24c8b9023ca8',
        kind: 'FORM',
        language: ['en', 'fr'],
        name: 'MiniMentalStateExamination',
        tags: {
          en: ['Cognitive'],
          fr: ['Cognitif']
        },
        version: 1
      },
      {
        details: {
          authors: [],
          description: {
            en: 'This instrument is designed to capture more specific demographic data, beyond that which is required for initial subject registration. All questions are optional.',
            fr: "Cet instrument est conçu pour recueillir des données démographiques plus spécifiques que celles requises pour l'enregistrement initial des sujets. celles qui sont requises pour l'enregistrement initial des sujets. Toutes les questions sont optionnelles."
          },
          estimatedDuration: 5,
          instructions: {
            en: [
              'Please provide the most accurate answer for the following questions. If there are more than one correct answers, select the one that is more applicable.'
            ],
            fr: [
              "Veuillez fournir la réponse la plus précise aux questions suivantes. S'il y a plusieurs réponses correctes, choisissez celle qui s'applique le mieux."
            ]
          },
          license: 'AGPL-3.0',
          referenceUrl: null,
          sourceUrl: null,
          title: {
            en: 'Enhanced Demographics Questionnaire',
            fr: 'Questionnaire démographique détaillé'
          }
        },
        id: '65dd26ad933b24c8b9023ca9',
        kind: 'FORM',
        language: ['en', 'fr'],
        name: 'EnhancedDemographicsQuestionnaire',
        tags: {
          en: ['Demographics'],
          fr: ['Démographie']
        },
        version: 1
      },
      {
        details: {
          authors: ['Andrzej Mazur', 'Mozilla Contributors', 'Joshua Unrau'],
          description:
            'This is a very simple interactive instrument, adapted from a 2D breakout game in the Mozilla documentation.',
          estimatedDuration: 1,
          instructions: ['Please attempt to win the game as quickly as possible.'],
          license: 'CC0-1.0',
          referenceUrl: 'https://developer.mozilla.org/en-US/docs/Games/Tutorials/2D_Breakout_game_pure_JavaScript',
          sourceUrl: 'https://github.com/end3r/Gamedev-Canvas-workshop/tree/gh-pages',
          title: 'Breakout Task'
        },
        id: '65dd26ad933b24c8b9023caa',
        kind: 'INTERACTIVE',
        language: 'en',
        name: 'Breakout Task',
        tags: ['Interactive'],
        version: 1
      }
    ]);
  }),

  http.get('/v1/instruments/65e730e24344d866399e41e8', () => {
    return HttpResponse.json({
      details: {
        authors: [],
        description: {
          en: 'The Happiness Questionnaire is a questionnaire about happiness.',
          fr: 'Le questionnaire sur le bonheur est un questionnaire sur le bonheur.'
        },
        estimatedDuration: 1,
        instructions: {
          en: ['Please answer the question based on your current feelings.'],
          fr: ['Veuillez répondre à la question en fonction de vos sentiments actuels.']
        },
        license: 'AGPL-3.0',
        referenceUrl: null,
        sourceUrl: null,
        title: {
          en: 'Happiness Questionnaire',
          fr: 'Questionnaire sur le bonheur'
        }
      },
      createdAt: '2024-03-05T14:49:06.485Z',
      updatedAt: '2024-03-05T14:49:06.485Z',
      id: '65e730e24344d866399e41e8',
      source:
        "/* eslint-disable perfectionist/sort-objects */\n\nconst { InstrumentFactory } = await import('/runtime/v0.0.1/core.js');\nconst { z } = await import('/runtime/v0.0.1/zod.js');\n\nconst instrumentFactory = new InstrumentFactory({\n  kind: 'FORM',\n  language: ['en', 'fr'],\n  validationSchema: z.object({\n    overallHappiness: z.number().int().gte(1).lte(10),\n    reasonForSadness: z.string().optional()\n  })\n});\n\nexport default instrumentFactory.defineInstrument({\n  name: 'HappinessQuestionnaire',\n  tags: {\n    en: ['Well-Being'],\n    fr: ['Bien-être']\n  },\n  version: 1,\n  content: {\n    overallHappiness: {\n      description: {\n        en: 'Overall happiness from 1 through 10 (inclusive)',\n        fr: 'Bonheur général de 1 à 10 (inclus)'\n      },\n      kind: 'numeric',\n      label: {\n        en: 'Overall Happiness',\n        fr: 'Bonheur général'\n      },\n      max: 10,\n      min: 1,\n      variant: 'slider'\n    },\n    reasonForSadness: {\n      deps: ['overallHappiness'],\n      kind: 'dynamic',\n      render: (data) => {\n        if (!data?.overallHappiness || data.overallHappiness >= 5) {\n          return null;\n        }\n        return {\n          label: {\n            en: 'Reason for Sadness',\n            fr: 'Raison de la tristesse'\n          },\n          isRequired: false,\n          kind: 'text',\n          variant: 'long'\n        };\n      }\n    }\n  },\n  details: {\n    description: {\n      en: 'The Happiness Questionnaire is a questionnaire about happiness.',\n      fr: 'Le questionnaire sur le bonheur est un questionnaire sur le bonheur.'\n    },\n    estimatedDuration: 1,\n    instructions: {\n      en: ['Please answer the question based on your current feelings.'],\n      fr: ['Veuillez répondre à la question en fonction de vos sentiments actuels.']\n    },\n    license: 'AGPL-3.0',\n    title: {\n      en: 'Happiness Questionnaire',\n      fr: 'Questionnaire sur le bonheur'\n    }\n  },\n  measures: {\n    overallHappiness: {\n      kind: 'const',\n      ref: 'overallHappiness'\n    }\n  }\n});\n",
      bundle:
        '(async()=>{const{InstrumentFactory:s}=await import("/runtime/v0.0.1/core.js"),{z:e}=await import("/runtime/v0.0.1/zod.js");return new s({kind:"FORM",language:["en","fr"],validationSchema:e.object({overallHappiness:e.number().int().gte(1).lte(10),reasonForSadness:e.string().optional()})}).defineInstrument({name:"HappinessQuestionnaire",tags:{en:["Well-Being"],fr:["Bien-\\xEAtre"]},version:1,content:{overallHappiness:{description:{en:"Overall happiness from 1 through 10 (inclusive)",fr:"Bonheur g\\xE9n\\xE9ral de 1 \\xE0 10 (inclus)"},kind:"numeric",label:{en:"Overall Happiness",fr:"Bonheur g\\xE9n\\xE9ral"},max:10,min:1,variant:"slider"},reasonForSadness:{deps:["overallHappiness"],kind:"dynamic",render:n=>!n?.overallHappiness||n.overallHappiness>=5?null:{label:{en:"Reason for Sadness",fr:"Raison de la tristesse"},isRequired:!1,kind:"text",variant:"long"}}},details:{description:{en:"The Happiness Questionnaire is a questionnaire about happiness.",fr:"Le questionnaire sur le bonheur est un questionnaire sur le bonheur."},estimatedDuration:1,instructions:{en:["Please answer the question based on your current feelings."],fr:["Veuillez r\\xE9pondre \\xE0 la question en fonction de vos sentiments actuels."]},license:"AGPL-3.0",title:{en:"Happiness Questionnaire",fr:"Questionnaire sur le bonheur"}},measures:{overallHappiness:{kind:"const",ref:"overallHappiness"}}})})();\n',
      kind: 'FORM',
      language: ['en', 'fr'],
      name: 'HappinessQuestionnaire',
      tags: {
        en: ['Well-Being'],
        fr: ['Bien-être']
      },
      version: 1,
      __model__: 'Instrument'
    });
  }),

  http.get('/v1/instruments/65dd26a1933b24c8b9023ca1', () => {
    return HttpResponse.json({
      details: {
        authors: [],
        description: {
          en: 'The Happiness Questionnaire is a questionnaire about happiness.',
          fr: 'Le questionnaire sur le bonheur est un questionnaire sur le bonheur.'
        },
        estimatedDuration: 1,
        instructions: {
          en: ['Please answer the question based on your current feelings.'],
          fr: ['Veuillez répondre à la question en fonction de vos sentiments actuels.']
        },
        license: 'AGPL-3.0',
        referenceUrl: null,
        sourceUrl: null,
        title: {
          en: 'Happiness Questionnaire',
          fr: 'Questionnaire sur le bonheur'
        }
      },
      createdAt: '2024-03-05T14:49:06.485Z',
      updatedAt: '2024-03-05T14:49:06.485Z',
      id: '65e730e24344d866399e41e8',
      source:
        "/* eslint-disable perfectionist/sort-objects */\n\nconst { InstrumentFactory } = await import('/runtime/v0.0.1/core.js');\nconst { z } = await import('/runtime/v0.0.1/zod.js');\n\nconst instrumentFactory = new InstrumentFactory({\n  kind: 'FORM',\n  language: ['en', 'fr'],\n  validationSchema: z.object({\n    overallHappiness: z.number().int().gte(1).lte(10),\n    reasonForSadness: z.string().optional()\n  })\n});\n\nexport default instrumentFactory.defineInstrument({\n  name: 'HappinessQuestionnaire',\n  tags: {\n    en: ['Well-Being'],\n    fr: ['Bien-être']\n  },\n  version: 1,\n  content: {\n    overallHappiness: {\n      description: {\n        en: 'Overall happiness from 1 through 10 (inclusive)',\n        fr: 'Bonheur général de 1 à 10 (inclus)'\n      },\n      kind: 'numeric',\n      label: {\n        en: 'Overall Happiness',\n        fr: 'Bonheur général'\n      },\n      max: 10,\n      min: 1,\n      variant: 'slider'\n    },\n    reasonForSadness: {\n      deps: ['overallHappiness'],\n      kind: 'dynamic',\n      render: (data) => {\n        if (!data?.overallHappiness || data.overallHappiness >= 5) {\n          return null;\n        }\n        return {\n          label: {\n            en: 'Reason for Sadness',\n            fr: 'Raison de la tristesse'\n          },\n          isRequired: false,\n          kind: 'text',\n          variant: 'long'\n        };\n      }\n    }\n  },\n  details: {\n    description: {\n      en: 'The Happiness Questionnaire is a questionnaire about happiness.',\n      fr: 'Le questionnaire sur le bonheur est un questionnaire sur le bonheur.'\n    },\n    estimatedDuration: 1,\n    instructions: {\n      en: ['Please answer the question based on your current feelings.'],\n      fr: ['Veuillez répondre à la question en fonction de vos sentiments actuels.']\n    },\n    license: 'AGPL-3.0',\n    title: {\n      en: 'Happiness Questionnaire',\n      fr: 'Questionnaire sur le bonheur'\n    }\n  },\n  measures: {\n    overallHappiness: {\n      kind: 'const',\n      ref: 'overallHappiness'\n    }\n  }\n});\n",
      bundle:
        '(async()=>{const{InstrumentFactory:s}=await import("/runtime/v0.0.1/core.js"),{z:e}=await import("/runtime/v0.0.1/zod.js");return new s({kind:"FORM",language:["en","fr"],validationSchema:e.object({overallHappiness:e.number().int().gte(1).lte(10),reasonForSadness:e.string().optional()})}).defineInstrument({name:"HappinessQuestionnaire",tags:{en:["Well-Being"],fr:["Bien-\\xEAtre"]},version:1,content:{overallHappiness:{description:{en:"Overall happiness from 1 through 10 (inclusive)",fr:"Bonheur g\\xE9n\\xE9ral de 1 \\xE0 10 (inclus)"},kind:"numeric",label:{en:"Overall Happiness",fr:"Bonheur g\\xE9n\\xE9ral"},max:10,min:1,variant:"slider"},reasonForSadness:{deps:["overallHappiness"],kind:"dynamic",render:n=>!n?.overallHappiness||n.overallHappiness>=5?null:{label:{en:"Reason for Sadness",fr:"Raison de la tristesse"},isRequired:!1,kind:"text",variant:"long"}}},details:{description:{en:"The Happiness Questionnaire is a questionnaire about happiness.",fr:"Le questionnaire sur le bonheur est un questionnaire sur le bonheur."},estimatedDuration:1,instructions:{en:["Please answer the question based on your current feelings."],fr:["Veuillez r\\xE9pondre \\xE0 la question en fonction de vos sentiments actuels."]},license:"AGPL-3.0",title:{en:"Happiness Questionnaire",fr:"Questionnaire sur le bonheur"}},measures:{overallHappiness:{kind:"const",ref:"overallHappiness"}}})})();\n',
      kind: 'FORM',
      language: ['en', 'fr'],
      name: 'HappinessQuestionnaire',
      tags: {
        en: ['Well-Being'],
        fr: ['Bien-être']
      },
      version: 1,
      __model__: 'Instrument'
    });
  }),

  http.get('/v1/instruments/65dd26ad933b24c8b9023ca7', () => {
    return HttpResponse.json({
      details: {
        authors: [],
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
        referenceUrl: null,
        sourceUrl: null,
        title: {
          en: 'Montreal Cognitive Assessment',
          fr: 'Montreal Cognitive Assessment'
        }
      },
      createdAt: '2024-02-27T00:02:41.459Z',
      updatedAt: '2024-02-27T00:02:41.459Z',
      id: '65dd26ad933b24c8b9023ca7',
      source:
        "/* eslint-disable perfectionist/sort-objects */\n\nconst { InstrumentFactory } = await import('/runtime/v0.0.1/core.js');\nconst { z } = await import('/runtime/v0.0.1/zod.js');\n\nconst instrumentFactory = new InstrumentFactory({\n  kind: 'FORM',\n  language: ['en', 'fr'],\n  validationSchema: z.object({\n    abstraction: z.number().int().gte(0).lte(2),\n    attention: z.number().int().gte(0).lte(6),\n    delayedRecall: z.number().int().gte(0).lte(5),\n    language: z.number().int().gte(0).lte(3),\n    lowEdu: z.boolean(),\n    naming: z.number().int().gte(0).lte(3),\n    orientation: z.number().int().gte(0).lte(6),\n    visuospatialExecutive: z.number().int().gte(0).lte(5)\n  })\n});\n\nexport default instrumentFactory.defineInstrument({\n  name: 'MontrealCognitiveAssessment',\n  tags: {\n    en: ['Cognitive'],\n    fr: ['Cognitif']\n  },\n  version: 8.1,\n  content: {\n    abstraction: {\n      kind: 'numeric',\n      label: {\n        en: 'Abstraction',\n        fr: 'Abstraction'\n      },\n      max: 2,\n      min: 0,\n      variant: 'default'\n    },\n    attention: {\n      kind: 'numeric',\n      label: {\n        en: 'Attention',\n        fr: 'Attention'\n      },\n      max: 6,\n      min: 0,\n      variant: 'default'\n    },\n    delayedRecall: {\n      kind: 'numeric',\n      label: {\n        en: 'Delayed Recall',\n        fr: 'Rappel'\n      },\n      max: 5,\n      min: 0,\n      variant: 'default'\n    },\n    language: {\n      kind: 'numeric',\n      label: {\n        en: 'Language',\n        fr: 'Langue'\n      },\n      max: 3,\n      min: 0,\n      variant: 'default'\n    },\n    lowEdu: {\n      kind: 'binary',\n      label: {\n        en: 'Less Than 12 Years of Education',\n        fr: \"Moins de 12 ans d'études\"\n      },\n      options: {\n        en: {\n          f: 'No',\n          t: 'Yes'\n        },\n        fr: {\n          f: 'No',\n          t: 'Oui'\n        }\n      },\n      variant: 'radio'\n    },\n    naming: {\n      kind: 'numeric',\n      label: {\n        en: 'Naming',\n        fr: 'Dénomination'\n      },\n      max: 3,\n      min: 0,\n      variant: 'default'\n    },\n    orientation: {\n      kind: 'numeric',\n      label: {\n        en: 'Orientation',\n        fr: 'Orientation'\n      },\n      max: 6,\n      min: 0,\n      variant: 'default'\n    },\n    visuospatialExecutive: {\n      kind: 'numeric',\n      label: {\n        en: 'Visuospatial/Executive',\n        fr: 'Visuospatial/Exécutif'\n      },\n      max: 5,\n      min: 0,\n      variant: 'default'\n    }\n  },\n  details: {\n    description: {\n      en: 'The Montreal Cognitive Assessment (MoCA) was designed as a rapid screening instrument for mild cognitive dysfunction. It assesses different cognitive domains: attention and concentration, executive functions, memory, language, visuoconstructional skills, conceptual thinking, calculations, and orientation. The MoCA may be administered by anyone who understands and follows the instructions, however, only a health professional with expertise in the cognitive field may interpret the results. Time to administer the MoCA is approximately 10 minutes. The total possible score is 30 points; a score of 26 or above is considered normal.',\n      fr: \"Le Montreal Cognitive Assessment (MoCA) a été conçue comme un instrument de dépistage rapide des troubles cognitifs légers. Il évalue différents domaines cognitifs : l'attention et la concentration, les fonctions exécutives, la mémoire, le langage, les capacités visuoconstructives, la pensée conceptuelle, les calculs et l'orientation. Le MoCA peut être administré par toute personne qui comprend et suit les instructions, mais seul un professionnel de la santé spécialisé dans le domaine cognitif peut interpréter les résultats. L'administration du MoCA dure environ 10 minutes. Le score total possible est de 30 points ; un score de 26 ou plus est considéré comme normal.\"\n    },\n    estimatedDuration: 10,\n    instructions: {\n      en: ['All instructions may be repeated once.'],\n      fr: ['Toutes les instructions peuvent être répétées une fois.']\n    },\n    license: 'UNLICENSED',\n    title: {\n      en: 'Montreal Cognitive Assessment',\n      fr: 'Montreal Cognitive Assessment'\n    }\n  },\n  measures: {\n    abstraction: {\n      kind: 'const',\n      ref: 'abstraction'\n    },\n    attention: {\n      kind: 'const',\n      ref: 'attention'\n    },\n    delayedRecall: {\n      kind: 'const',\n      ref: 'delayedRecall'\n    },\n    language: {\n      kind: 'const',\n      ref: 'language'\n    },\n    naming: {\n      kind: 'const',\n      ref: 'naming'\n    },\n    orientation: {\n      kind: 'const',\n      ref: 'orientation'\n    },\n    totalScore: {\n      kind: 'computed',\n      label: {\n        en: 'Total Score',\n        fr: 'Score total'\n      },\n      value: (data) => {\n        let sum = 0;\n        Object.values(data).forEach((value) => {\n          sum += Number(value);\n        });\n        return sum;\n      }\n    },\n    visuospatialExecutive: {\n      kind: 'const',\n      ref: 'visuospatialExecutive'\n    }\n  }\n});\n",
      bundle:
        '(async()=>{const{InstrumentFactory:t}=await import("/runtime/v0.0.1/core.js"),{z:e}=await import("/runtime/v0.0.1/zod.js");return new t({kind:"FORM",language:["en","fr"],validationSchema:e.object({abstraction:e.number().int().gte(0).lte(2),attention:e.number().int().gte(0).lte(6),delayedRecall:e.number().int().gte(0).lte(5),language:e.number().int().gte(0).lte(3),lowEdu:e.boolean(),naming:e.number().int().gte(0).lte(3),orientation:e.number().int().gte(0).lte(6),visuospatialExecutive:e.number().int().gte(0).lte(5)})}).defineInstrument({name:"MontrealCognitiveAssessment",tags:{en:["Cognitive"],fr:["Cognitif"]},version:8.1,content:{abstraction:{kind:"numeric",label:{en:"Abstraction",fr:"Abstraction"},max:2,min:0,variant:"default"},attention:{kind:"numeric",label:{en:"Attention",fr:"Attention"},max:6,min:0,variant:"default"},delayedRecall:{kind:"numeric",label:{en:"Delayed Recall",fr:"Rappel"},max:5,min:0,variant:"default"},language:{kind:"numeric",label:{en:"Language",fr:"Langue"},max:3,min:0,variant:"default"},lowEdu:{kind:"binary",label:{en:"Less Than 12 Years of Education",fr:"Moins de 12 ans d\'\\xE9tudes"},options:{en:{f:"No",t:"Yes"},fr:{f:"No",t:"Oui"}},variant:"radio"},naming:{kind:"numeric",label:{en:"Naming",fr:"D\\xE9nomination"},max:3,min:0,variant:"default"},orientation:{kind:"numeric",label:{en:"Orientation",fr:"Orientation"},max:6,min:0,variant:"default"},visuospatialExecutive:{kind:"numeric",label:{en:"Visuospatial/Executive",fr:"Visuospatial/Ex\\xE9cutif"},max:5,min:0,variant:"default"}},details:{description:{en:"The Montreal Cognitive Assessment (MoCA) was designed as a rapid screening instrument for mild cognitive dysfunction. It assesses different cognitive domains: attention and concentration, executive functions, memory, language, visuoconstructional skills, conceptual thinking, calculations, and orientation. The MoCA may be administered by anyone who understands and follows the instructions, however, only a health professional with expertise in the cognitive field may interpret the results. Time to administer the MoCA is approximately 10 minutes. The total possible score is 30 points; a score of 26 or above is considered normal.",fr:"Le Montreal Cognitive Assessment (MoCA) a \\xE9t\\xE9 con\\xE7ue comme un instrument de d\\xE9pistage rapide des troubles cognitifs l\\xE9gers. Il \\xE9value diff\\xE9rents domaines cognitifs : l\'attention et la concentration, les fonctions ex\\xE9cutives, la m\\xE9moire, le langage, les capacit\\xE9s visuoconstructives, la pens\\xE9e conceptuelle, les calculs et l\'orientation. Le MoCA peut \\xEAtre administr\\xE9 par toute personne qui comprend et suit les instructions, mais seul un professionnel de la sant\\xE9 sp\\xE9cialis\\xE9 dans le domaine cognitif peut interpr\\xE9ter les r\\xE9sultats. L\'administration du MoCA dure environ 10 minutes. Le score total possible est de 30 points ; un score de 26 ou plus est consid\\xE9r\\xE9 comme normal."},estimatedDuration:10,instructions:{en:["All instructions may be repeated once."],fr:["Toutes les instructions peuvent \\xEAtre r\\xE9p\\xE9t\\xE9es une fois."]},license:"UNLICENSED",title:{en:"Montreal Cognitive Assessment",fr:"Montreal Cognitive Assessment"}},measures:{abstraction:{kind:"const",ref:"abstraction"},attention:{kind:"const",ref:"attention"},delayedRecall:{kind:"const",ref:"delayedRecall"},language:{kind:"const",ref:"language"},naming:{kind:"const",ref:"naming"},orientation:{kind:"const",ref:"orientation"},totalScore:{kind:"computed",label:{en:"Total Score",fr:"Score total"},value:i=>{let n=0;return Object.values(i).forEach(a=>{n+=Number(a)}),n}},visuospatialExecutive:{kind:"const",ref:"visuospatialExecutive"}}})})();\n',
      kind: 'FORM',
      language: ['en', 'fr'],
      name: 'MontrealCognitiveAssessment',
      tags: {
        en: ['Cognitive'],
        fr: ['Cognitif']
      },
      version: 8.1,
      __model__: 'Instrument'
    });
  }),

  http.get('/v1/instruments/render/65dd26ad933b24c8b9023ca7', () => {
    return HttpResponse.json({
      details: {
        authors: [],
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
        referenceUrl: null,
        sourceUrl: null,
        title: {
          en: 'Montreal Cognitive Assessment',
          fr: 'Montreal Cognitive Assessment'
        }
      },
      createdAt: '2024-02-27T00:02:41.459Z',
      updatedAt: '2024-02-27T00:02:41.459Z',
      id: '65dd26ad933b24c8b9023ca7',
      source:
        "/* eslint-disable perfectionist/sort-objects */\n\nconst { InstrumentFactory } = await import('/runtime/v0.0.1/core.js');\nconst { z } = await import('/runtime/v0.0.1/zod.js');\n\nconst instrumentFactory = new InstrumentFactory({\n  kind: 'FORM',\n  language: ['en', 'fr'],\n  validationSchema: z.object({\n    abstraction: z.number().int().gte(0).lte(2),\n    attention: z.number().int().gte(0).lte(6),\n    delayedRecall: z.number().int().gte(0).lte(5),\n    language: z.number().int().gte(0).lte(3),\n    lowEdu: z.boolean(),\n    naming: z.number().int().gte(0).lte(3),\n    orientation: z.number().int().gte(0).lte(6),\n    visuospatialExecutive: z.number().int().gte(0).lte(5)\n  })\n});\n\nexport default instrumentFactory.defineInstrument({\n  name: 'MontrealCognitiveAssessment',\n  tags: {\n    en: ['Cognitive'],\n    fr: ['Cognitif']\n  },\n  version: 8.1,\n  content: {\n    abstraction: {\n      kind: 'numeric',\n      label: {\n        en: 'Abstraction',\n        fr: 'Abstraction'\n      },\n      max: 2,\n      min: 0,\n      variant: 'default'\n    },\n    attention: {\n      kind: 'numeric',\n      label: {\n        en: 'Attention',\n        fr: 'Attention'\n      },\n      max: 6,\n      min: 0,\n      variant: 'default'\n    },\n    delayedRecall: {\n      kind: 'numeric',\n      label: {\n        en: 'Delayed Recall',\n        fr: 'Rappel'\n      },\n      max: 5,\n      min: 0,\n      variant: 'default'\n    },\n    language: {\n      kind: 'numeric',\n      label: {\n        en: 'Language',\n        fr: 'Langue'\n      },\n      max: 3,\n      min: 0,\n      variant: 'default'\n    },\n    lowEdu: {\n      kind: 'binary',\n      label: {\n        en: 'Less Than 12 Years of Education',\n        fr: \"Moins de 12 ans d'études\"\n      },\n      options: {\n        en: {\n          f: 'No',\n          t: 'Yes'\n        },\n        fr: {\n          f: 'No',\n          t: 'Oui'\n        }\n      },\n      variant: 'radio'\n    },\n    naming: {\n      kind: 'numeric',\n      label: {\n        en: 'Naming',\n        fr: 'Dénomination'\n      },\n      max: 3,\n      min: 0,\n      variant: 'default'\n    },\n    orientation: {\n      kind: 'numeric',\n      label: {\n        en: 'Orientation',\n        fr: 'Orientation'\n      },\n      max: 6,\n      min: 0,\n      variant: 'default'\n    },\n    visuospatialExecutive: {\n      kind: 'numeric',\n      label: {\n        en: 'Visuospatial/Executive',\n        fr: 'Visuospatial/Exécutif'\n      },\n      max: 5,\n      min: 0,\n      variant: 'default'\n    }\n  },\n  details: {\n    description: {\n      en: 'The Montreal Cognitive Assessment (MoCA) was designed as a rapid screening instrument for mild cognitive dysfunction. It assesses different cognitive domains: attention and concentration, executive functions, memory, language, visuoconstructional skills, conceptual thinking, calculations, and orientation. The MoCA may be administered by anyone who understands and follows the instructions, however, only a health professional with expertise in the cognitive field may interpret the results. Time to administer the MoCA is approximately 10 minutes. The total possible score is 30 points; a score of 26 or above is considered normal.',\n      fr: \"Le Montreal Cognitive Assessment (MoCA) a été conçue comme un instrument de dépistage rapide des troubles cognitifs légers. Il évalue différents domaines cognitifs : l'attention et la concentration, les fonctions exécutives, la mémoire, le langage, les capacités visuoconstructives, la pensée conceptuelle, les calculs et l'orientation. Le MoCA peut être administré par toute personne qui comprend et suit les instructions, mais seul un professionnel de la santé spécialisé dans le domaine cognitif peut interpréter les résultats. L'administration du MoCA dure environ 10 minutes. Le score total possible est de 30 points ; un score de 26 ou plus est considéré comme normal.\"\n    },\n    estimatedDuration: 10,\n    instructions: {\n      en: ['All instructions may be repeated once.'],\n      fr: ['Toutes les instructions peuvent être répétées une fois.']\n    },\n    license: 'UNLICENSED',\n    title: {\n      en: 'Montreal Cognitive Assessment',\n      fr: 'Montreal Cognitive Assessment'\n    }\n  },\n  measures: {\n    abstraction: {\n      kind: 'const',\n      ref: 'abstraction'\n    },\n    attention: {\n      kind: 'const',\n      ref: 'attention'\n    },\n    delayedRecall: {\n      kind: 'const',\n      ref: 'delayedRecall'\n    },\n    language: {\n      kind: 'const',\n      ref: 'language'\n    },\n    naming: {\n      kind: 'const',\n      ref: 'naming'\n    },\n    orientation: {\n      kind: 'const',\n      ref: 'orientation'\n    },\n    totalScore: {\n      kind: 'computed',\n      label: {\n        en: 'Total Score',\n        fr: 'Score total'\n      },\n      value: (data) => {\n        let sum = 0;\n        Object.values(data).forEach((value) => {\n          sum += Number(value);\n        });\n        return sum;\n      }\n    },\n    visuospatialExecutive: {\n      kind: 'const',\n      ref: 'visuospatialExecutive'\n    }\n  }\n});\n",
      bundle:
        '(async()=>{const{InstrumentFactory:t}=await import("/runtime/v0.0.1/core.js"),{z:e}=await import("/runtime/v0.0.1/zod.js");return new t({kind:"FORM",language:["en","fr"],validationSchema:e.object({abstraction:e.number().int().gte(0).lte(2),attention:e.number().int().gte(0).lte(6),delayedRecall:e.number().int().gte(0).lte(5),language:e.number().int().gte(0).lte(3),lowEdu:e.boolean(),naming:e.number().int().gte(0).lte(3),orientation:e.number().int().gte(0).lte(6),visuospatialExecutive:e.number().int().gte(0).lte(5)})}).defineInstrument({name:"MontrealCognitiveAssessment",tags:{en:["Cognitive"],fr:["Cognitif"]},version:8.1,content:{abstraction:{kind:"numeric",label:{en:"Abstraction",fr:"Abstraction"},max:2,min:0,variant:"default"},attention:{kind:"numeric",label:{en:"Attention",fr:"Attention"},max:6,min:0,variant:"default"},delayedRecall:{kind:"numeric",label:{en:"Delayed Recall",fr:"Rappel"},max:5,min:0,variant:"default"},language:{kind:"numeric",label:{en:"Language",fr:"Langue"},max:3,min:0,variant:"default"},lowEdu:{kind:"binary",label:{en:"Less Than 12 Years of Education",fr:"Moins de 12 ans d\'\\xE9tudes"},options:{en:{f:"No",t:"Yes"},fr:{f:"No",t:"Oui"}},variant:"radio"},naming:{kind:"numeric",label:{en:"Naming",fr:"D\\xE9nomination"},max:3,min:0,variant:"default"},orientation:{kind:"numeric",label:{en:"Orientation",fr:"Orientation"},max:6,min:0,variant:"default"},visuospatialExecutive:{kind:"numeric",label:{en:"Visuospatial/Executive",fr:"Visuospatial/Ex\\xE9cutif"},max:5,min:0,variant:"default"}},details:{description:{en:"The Montreal Cognitive Assessment (MoCA) was designed as a rapid screening instrument for mild cognitive dysfunction. It assesses different cognitive domains: attention and concentration, executive functions, memory, language, visuoconstructional skills, conceptual thinking, calculations, and orientation. The MoCA may be administered by anyone who understands and follows the instructions, however, only a health professional with expertise in the cognitive field may interpret the results. Time to administer the MoCA is approximately 10 minutes. The total possible score is 30 points; a score of 26 or above is considered normal.",fr:"Le Montreal Cognitive Assessment (MoCA) a \\xE9t\\xE9 con\\xE7ue comme un instrument de d\\xE9pistage rapide des troubles cognitifs l\\xE9gers. Il \\xE9value diff\\xE9rents domaines cognitifs : l\'attention et la concentration, les fonctions ex\\xE9cutives, la m\\xE9moire, le langage, les capacit\\xE9s visuoconstructives, la pens\\xE9e conceptuelle, les calculs et l\'orientation. Le MoCA peut \\xEAtre administr\\xE9 par toute personne qui comprend et suit les instructions, mais seul un professionnel de la sant\\xE9 sp\\xE9cialis\\xE9 dans le domaine cognitif peut interpr\\xE9ter les r\\xE9sultats. L\'administration du MoCA dure environ 10 minutes. Le score total possible est de 30 points ; un score de 26 ou plus est consid\\xE9r\\xE9 comme normal."},estimatedDuration:10,instructions:{en:["All instructions may be repeated once."],fr:["Toutes les instructions peuvent \\xEAtre r\\xE9p\\xE9t\\xE9es une fois."]},license:"UNLICENSED",title:{en:"Montreal Cognitive Assessment",fr:"Montreal Cognitive Assessment"}},measures:{abstraction:{kind:"const",ref:"abstraction"},attention:{kind:"const",ref:"attention"},delayedRecall:{kind:"const",ref:"delayedRecall"},language:{kind:"const",ref:"language"},naming:{kind:"const",ref:"naming"},orientation:{kind:"const",ref:"orientation"},totalScore:{kind:"computed",label:{en:"Total Score",fr:"Score total"},value:i=>{let n=0;return Object.values(i).forEach(a=>{n+=Number(a)}),n}},visuospatialExecutive:{kind:"const",ref:"visuospatialExecutive"}}})})();\n',
      kind: 'FORM',
      language: ['en', 'fr'],
      name: 'MontrealCognitiveAssessment',
      tags: {
        en: ['Cognitive'],
        fr: ['Cognitif']
      },
      version: 8.1,
      __model__: 'Instrument'
    });
  })
];
