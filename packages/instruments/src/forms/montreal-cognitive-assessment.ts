import { createTranslatedForms } from '..';

export type MontrealCognitiveAssessmentData = {
  trailMaking: boolean;
  copyCube: boolean;
  drawClock: number;
  canNameLion: boolean;
  canNameRhino: boolean;
  canNameCamel: boolean;
};

export const montrealCognitiveAssessment = createTranslatedForms<MontrealCognitiveAssessmentData>({
  name: 'MontrealCognitiveAssessment',
  tags: ['Cognitive'],
  version: 8.1,
  details: {
    estimatedDuration: 10,
    title: {
      en: 'Montreal Cognitive Assessment (English)',
      fr: 'Montreal Cognitive Assessment (Français)'
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
        fr: 'Visuospatial/Executive'
      },
      fields: {
        trailMaking: {
          kind: 'binary',
          label: {
            en: 'Alternating Trail Making',
            fr: 'Alternating Trail Making'
          }
        },
        copyCube: {
          kind: 'binary',
          label: {
            en: 'Visuoconstructional Skills (Cube)',
            fr: 'Visuoconstructional Skills (Cube)'
          }
        },
        drawClock: {
          kind: 'numeric',
          label: {
            en: 'Visuoconstructional Skills (Clock)',
            fr: 'Visuoconstructional Skills (Clock)'
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
        fr: 'Naming'
      },
      fields: {
        canNameLion: {
          kind: 'binary',
          label: {
            en: 'Lion',
            fr: 'Lion'
          }
        },
        canNameRhino: {
          kind: 'binary',
          label: {
            en: 'Rhinoceros',
            fr: 'Rhinocéros'
          }
        },
        canNameCamel: {
          kind: 'binary',
          label: {
            en: 'Camel',
            fr: 'Chameau'
          }
        }
      }
    }
  ],
  validationSchema: {
    type: 'object',
    required: []
  }
});
