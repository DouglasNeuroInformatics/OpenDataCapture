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
          title: { en: 'Happiness Questionnaire', fr: 'Questionnaire sur le bonheur' }
        },
        id: '65d5179227e183f93166d4b2',
        kind: 'FORM',
        language: ['en', 'fr'],
        name: 'HappinessQuestionnaire',
        tags: { en: ['Well-Being'], fr: ['Bien-être'] },
        version: 1
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
        id: '65d5179e27e183f93166d4b7',
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
          title: { en: 'Enhanced Demographics Questionnaire', fr: 'Questionnaire démographique détaillé' }
        },
        id: '65d5179e27e183f93166d4b8',
        kind: 'FORM',
        language: ['en', 'fr'],
        name: 'EnhancedDemographicsQuestionnaire',
        tags: { en: ['Demographics'], fr: ['Démographie'] },
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
          title: { en: 'Montreal Cognitive Assessment', fr: 'Montreal Cognitive Assessment' }
        },
        id: '65d5179e27e183f93166d4b9',
        kind: 'FORM',
        language: ['en', 'fr'],
        name: 'MontrealCognitiveAssessment',
        tags: { en: ['Cognitive'], fr: ['Cognitif'] },
        version: 8.1
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
          title: { en: 'Mini Mental State Examination', fr: "Mini-examen de l'état mental" }
        },
        id: '65d5179e27e183f93166d4ba',
        kind: 'FORM',
        language: ['en', 'fr'],
        name: 'MiniMentalStateExamination',
        tags: { en: ['Cognitive'], fr: ['Cognitif'] },
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
        id: '65d5179e27e183f93166d4bb',
        kind: 'INTERACTIVE',
        language: 'en',
        name: 'Breakout Task',
        tags: ['Interactive'],
        version: 1
      }
    ]);
  })
];
