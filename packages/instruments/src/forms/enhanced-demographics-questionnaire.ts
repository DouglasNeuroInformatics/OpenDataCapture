import employmentStatus from '../data/employment-status.json';
import ethnicOrigin from '../data/ethnic-origin.json';
import firstLanguage from '../data/first-language.json';
import gender from '../data/gender.json';
import maritalStatus from '../data/marital-status.json';
import religion from '../data/religion.json';
import { createTranslatedForms } from '../utils/create-translated-forms';
import { extractKeys, formatOptions } from '../utils/format-options';

type EmploymentStatus = keyof typeof employmentStatus;
type EthnicOrigin = keyof typeof ethnicOrigin;
type FirstLanguage = keyof typeof firstLanguage;
type Gender = keyof typeof gender;
type MartialStatus = keyof typeof maritalStatus;
type Religion = keyof typeof religion;

const yesNoOptions = {
  en: {
    t: 'Yes',
    f: 'No'
  },
  fr: {
    t: 'Oui',
    f: 'Non'
  }
} as const;

type EnhancedDemographicsQuestionnaireData = {
  // Personal Characteristics
  gender?: Gender;
  ethnicOrigin?: EthnicOrigin;
  religion?: Religion;

  // Language
  firstLanguage?: FirstLanguage;
  speaksEnglish?: boolean;
  speaksFrench?: boolean;

  // Living Situation
  postalCode?: string;
  householdSize?: number;
  numberChildren?: number;
  maritalStatus?: MartialStatus;

  // Economic
  annualIncome?: number;
  employmentStatus?: EmploymentStatus;

  // Education
  yearsOfEducation?: number;

  // Immigration
  isCanadianCitizen?: boolean;
  ageAtImmigration?: number;
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
        religion: {
          kind: 'options',
          label: {
            en: 'Religion',
            fr: 'Religion'
          },
          options: formatOptions(religion)
        }
      }
    },
    {
      title: {
        en: 'Language',
        fr: 'Langue'
      },
      fields: {
        firstLanguage: {
          kind: 'options',
          label: {
            en: 'First Language',
            fr: 'Langue maternelle'
          },
          options: formatOptions(firstLanguage)
        },
        speaksEnglish: {
          kind: 'binary',
          label: {
            en: 'Speak and Understand English',
            fr: "Parler et comprendre l'anglais"
          },
          variant: 'radio',
          options: yesNoOptions
        },
        speaksFrench: {
          kind: 'binary',
          label: {
            en: 'Speak and Understand French',
            fr: 'Parler et comprendre le français'
          },
          variant: 'radio',
          options: yesNoOptions
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
        numberChildren: {
          kind: 'numeric',
          label: {
            en: 'Number of Children',
            fr: "Nombre d'enfants"
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
    },
    {
      title: {
        en: 'Education',
        fr: 'Éducation'
      },
      fields: {
        yearsOfEducation: {
          kind: 'numeric',
          label: {
            en: 'Years of Education',
            fr: "Années d'études"
          },
          variant: 'default',
          min: 0,
          max: 30
        }
      }
    },
    {
      title: {
        en: 'Immigration',
        fr: 'Immigration'
      },
      fields: {
        isCanadianCitizen: {
          kind: 'binary',
          label: {
            en: 'Canadian Citizen',
            fr: 'Citoyen canadien'
          },
          variant: 'radio',
          options: yesNoOptions
        },
        ageAtImmigration: {
          kind: 'numeric',
          label: {
            en: 'Age at Immigration',
            fr: "Âge à l'immigration (le cas échéant)"
          },
          variant: 'default',
          min: 1,
          max: 100
        }
      }
    }
  ],
  validationSchema: {
    type: 'object',
    properties: {
      ethnicOrigin: {
        type: 'string',
        enum: extractKeys(ethnicOrigin, true),
        nullable: true
      },
      gender: {
        type: 'string',
        enum: extractKeys(gender, true),
        nullable: true
      },
      religion: {
        type: 'string',
        enum: extractKeys(religion, true),
        nullable: true
      },
      firstLanguage: {
        type: 'string',
        enum: extractKeys(firstLanguage, true),
        nullable: true
      },
      speaksEnglish: {
        type: 'boolean',
        nullable: true
      },
      speaksFrench: {
        type: 'boolean',
        nullable: true
      },
      postalCode: {
        type: 'string',
        pattern: /^[A-Z]\d[A-Z][ -]?\d[A-Z]\d$/i.source,
        nullable: true
      },
      householdSize: {
        type: 'integer',
        minimum: 0,
        maximum: 20,
        nullable: true
      },
      numberChildren: {
        type: 'integer',
        minimum: 0,
        maximum: 20,
        nullable: true
      },
      maritalStatus: {
        type: 'string',
        enum: extractKeys(maritalStatus, true),
        nullable: true
      },
      annualIncome: {
        type: 'integer',
        minimum: 0,
        maximum: 1000000,
        nullable: true
      },
      employmentStatus: {
        type: 'string',
        enum: extractKeys(employmentStatus, true),
        nullable: true
      },
      yearsOfEducation: {
        type: 'integer',
        minimum: 0,
        maximum: 30,
        nullable: true
      },
      isCanadianCitizen: {
        type: 'boolean',
        nullable: true
      },
      ageAtImmigration: {
        type: 'integer',
        minimum: 1,
        maximum: 100,
        nullable: true
      }
    },
    required: []
  }
});
