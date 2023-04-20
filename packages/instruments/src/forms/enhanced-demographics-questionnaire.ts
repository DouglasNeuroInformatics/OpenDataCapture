import ethnicOrigin from '../data/ethnic-origin.json';
import gender from '../data/gender.json';
import { createTranslatedForms } from '../utils/create-translated-forms';
import { extractKeys, formatOptions } from '../utils/format-options';

type EthnicOrigin = keyof typeof ethnicOrigin;

type Gender = keyof typeof gender;

type EnhancedDemographicsQuestionnaireData = {
  /** Personal Characteristics */
  gender: Gender;
  ethnicOrigin: EthnicOrigin;

  /** Living Situation */
  postalCode: string;

  //annualIncome: number;
  //employmentStatus: 'fullTime' | 'partTime' | 'student' | 'unemployed';
  //maritalStatus: 'married' | 'widowed' | 'separated' | 'divorced' | 'single';
  //firstLanguage: 'english' | 'french' | 'other';

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
  content: {
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
    postalCode: {
      kind: 'text',
      label: {
        en: 'Postal Code',
        fr: 'Code postal'
      },
      variant: 'short'
    }
  },
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
      postalCode: {
        type: 'string',
        pattern: /^[A-Z]\d[A-Z][ -]?\d[A-Z]\d$/i.source
      }
    },
    required: ['ethnicOrigin', 'gender', 'postalCode']
  }
});
/*

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
  content: {
    genderIdentity: {
      kind: 'options',
      label: {
        en: 'Gender Identity',
        fr: 'Identité de genre'
      },
      options: formatOptions(genderIdentity)
    },
    ethnicOrigin: {
      kind: 'options',
      label: {
        en: 'Ethnic Origin',
        fr: 'Origine ethnique'
      },
      options: formatOptions(ethnicOrigin)
    },
    forwardSortationArea: {
      kind: 'text',
      label: {
        en: 'Forward Sortation Area',
        fr: "Région de tri d'acheminement"
      },
      description: {
        en: 'A forward sortation area (FSA) is a way to designate a geographical unit based on the first three characters in a Canadian postal code. All postal codes that start with the same three characters—for example, K1A—are together considered an FSA.',
        fr: "Une région de tri d'acheminement (RTA) est une unité géographique désignée par les trois premiers caractères d'un code postal canadien. Tous les codes postaux commençant par les trois mêmes caractères — par exemple, K1A — forment une même RTA."
      },
      variant: 'short'
    },
    employmentStatus: {
      kind: 'options',
      label: {
        en: 'Employment Status',
        fr: "Statut de l'emploi"
      },
      options: {
        en: {
          fullTime: 'Full-Time',
          partTime: 'Part-Time',
          student: 'Student',
          unemployed: 'Unemployed'
        },
        fr: {
          fullTime: 'Emploi à temps plein',
          partTime: 'Emploi à temps partiel',
          student: 'Étudiant',
          unemployed: 'Chômage'
        }
      }
    },
    maritalStatus: {
      kind: 'options',
      label: {
        en: 'Marital Status',
        fr: 'État civil'
      },
      options: {
        en: {
          married: 'Married (and not separated)',
          widowed: 'Widowed (including living common law)',
          separated: 'Separated (including living common law)',
          divorced: 'Divorced (including living common law)',
          single: 'Single (including living common law)'
        },
        fr: {
          married: 'Marié',
          widowed: 'Widowed (including living common law)',
          separated: 'Séparé (y compris vivant en union libre)',
          divorced: 'Divorcé (y compris vivant en union libre))',
          single: 'Jamais marié (y compris vivant en union libre)'
        }
      }
    },
    firstLanguage: {
      kind: 'options',
      label: {
        en: 'First Language',
        fr: 'Langue maternelle'
      },
      options: {
        en: {
          english: 'English',
          french: 'French',
          other: 'Other'
        },
        fr: {
          english: 'Anglais',
          french: 'Français',
          other: 'Autre'
        }
      }
    }
  },
  validationSchema: {
    type: 'object',
    properties: {
      annualIncome: {
        type: 'integer'
      },
      forwardSortationArea: {
        type: 'string',
        minLength: 3,
        maxLength: 3
      },
      ethnicity: {
        type: 'string',
        enum: ['asian', 'black', 'indigenous', 'other', 'white']
      },
      gender: {
        type: 'string',
        enum: ['female', 'male', 'nonBinary']
      },
      employmentStatus: {
        type: 'string',
        enum: ['fullTime', 'partTime', 'student', 'unemployed']
      },
      maritalStatus: {
        type: 'string',
        enum: ['divorced', 'married', 'separated', 'single', 'widowed']
      },
      firstLanguage: {
        type: 'string',
        enum: ['english', 'french', 'other']
      }
    },
    required: ['annualIncome']
  }
});
*/
