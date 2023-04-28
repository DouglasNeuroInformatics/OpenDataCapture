import employmentStatus from '../data/employment-status.json';
import ethnicOrigin from '../data/ethnic-origin.json';
import firstLanguage from '../data/first-language.json';
import gender from '../data/gender.json';
import maritalStatus from '../data/marital-status.json';
import { createTranslatedForms } from '../utils/create-translated-forms';
import { extractKeys, formatOptions } from '../utils/format-options';

type EmploymentStatus = keyof typeof employmentStatus;
type EthnicOrigin = keyof typeof ethnicOrigin;
type FirstLanguage = keyof typeof firstLanguage;
type Gender = keyof typeof gender;
type MartialStatus = keyof typeof maritalStatus;

type EnhancedDemographicsQuestionnaireData = {
  // Personal Characteristics
  gender: Gender;
  ethnicOrigin: EthnicOrigin;
  firstLanguage: FirstLanguage;

  /** Living Situation */
  postalCode: string;
  householdSize: number;
  maritalStatus: MartialStatus;

  /** Economic */
  annualIncome: number;
  employmentStatus: EmploymentStatus;

  /** Education */

  /** Families, Households and Marital Status */

  // numberChildren: number;

  /** Housing */

  /** Immigration and Ethnocultural Diversity */
  // ageAtImmigration: number;
  // citizenship: string;
  // immigrationStatus: string;

  /** Income */

  /** Labour */

  /** Language */
};

export const enhancedDemographicsQuestionnaire = createTranslatedForms<EnhancedDemographicsQuestionnaireData>({
  name: 'EnhancedDemographicsQuestionnaire',
  tags: ['Demographics'],
  version: 1,
  details: {
    title: {
      en: 'Enhanced Demographics Questionnaire',
      fr: 'Questionnaire démographique détaillé'
    },
    description: {
      en: 'This instrument is designed to capture more specific demographic data, beyond that which is required for initial subject registration',
      fr: "Cet instrument est conçu pour recueillir des données démographiques plus spécifiques que celles requises pour l'enregistrement initial des sujets. celles qui sont requises pour l'enregistrement initial des sujets"
    },
    instructions: {
      en: 'Please provide the most accurate answer for the following questions. If there are more than one correct answers, select the one that is more applicable.',
      fr: "Veuillez fournir la réponse la plus précise aux questions suivantes. S'il y a plusieurs réponses correctes, choisissez celle qui s'applique le mieux."
    },
    estimatedDuration: 5
  },
  content: [
    {
      title: {
        en: 'Personal Characteristics',
        fr: 'Caractéristiques individuelles'
      },
      fields: {
        gender: {
          kind: 'options',
          label: {
            en: 'Gender Identity',
            fr: 'Identité de genre'
          },
          options: formatOptions(gender)
        },
        ethnicOrigin: {
          kind: 'options',
          label: {
            en: 'Ethnic Origin',
            fr: 'Origine ethnique'
          },
          options: formatOptions(ethnicOrigin)
        },
        firstLanguage: {
          kind: 'options',
          label: {
            en: 'First Language',
            fr: 'Langue maternelle'
          },
          options: formatOptions(firstLanguage)
        }
      }
    },
    {
      title: {
        en: 'Living Situation',
        fr: 'Situation de vie'
      },
      fields: {
        postalCode: {
          kind: 'text',
          label: {
            en: 'Postal Code',
            fr: 'Code postal'
          },
          variant: 'short'
        },
        householdSize: {
          kind: 'numeric',
          label: {
            en: 'Household Size',
            fr: 'Taille du ménage'
          },
          variant: 'default',
          min: 0,
          max: 20
        },
        maritalStatus: {
          kind: 'options',
          label: {
            en: 'Martial Status',
            fr: 'État matrimonial'
          },
          options: formatOptions(maritalStatus)
        }
      }
    },
    {
      title: {
        en: 'Economic Situation',
        fr: 'Situation économique'
      },
      fields: {
        annualIncome: {
          kind: 'numeric',
          label: {
            en: 'Annual Income',
            fr: 'Revenu annuel'
          },
          variant: 'default',
          min: 0,
          max: 1000000
        },
        employmentStatus: {
          kind: 'options',
          label: {
            en: 'Employment Status',
            fr: "Statut de l'emploi"
          },
          options: formatOptions(employmentStatus)
        }
      }
    }
  ],
  validationSchema: {
    type: 'object',
    properties: {
      ethnicOrigin: {
        type: 'string',
        enum: extractKeys(ethnicOrigin)
      },
      gender: {
        type: 'string',
        enum: extractKeys(gender)
      },
      firstLanguage: {
        type: 'string',
        enum: extractKeys(firstLanguage)
      },
      postalCode: {
        type: 'string',
        pattern: /^[A-Z]\d[A-Z][ -]?\d[A-Z]\d$/i.source
      },
      householdSize: {
        type: 'integer',
        minimum: 0,
        maximum: 20
      },
      maritalStatus: {
        type: 'string',
        enum: extractKeys(maritalStatus)
      },
      annualIncome: {
        type: 'integer',
        minimum: 0,
        maximum: 1000000
      },
      employmentStatus: {
        type: 'string',
        enum: extractKeys(employmentStatus)
      }
    },
    required: [
      'annualIncome',
      'employmentStatus',
      'ethnicOrigin',
      'firstLanguage',
      'gender',
      'householdSize',
      'maritalStatus',
      'postalCode'
    ]
  }
});
