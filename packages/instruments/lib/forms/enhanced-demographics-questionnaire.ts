import { createMultilingualForms } from '../utils/create-multilingual-forms';

type EnhancedDemographicsQuestionnaireData = {
  /** Personal Characteristics */

  annualIncome: number;

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

export const enhancedDemographicsQuestionnaires = createMultilingualForms<EnhancedDemographicsQuestionnaireData>({
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
    annualIncome: {
      kind: 'numeric',
      variant: 'default',
      min: 0,
      max: 1000000,
      label: {
        en: 'Foo',
        fr: 'Foo'
      }
    }
  },
  validationSchema: {
    type: 'object',
    properties: {
      annualIncome: {
        type: 'integer'
      }
    },
    required: ['annualIncome']
  }
});

/*

export type EnhancedDemographicsQuestionnaireData = {
  forwardSortationArea: string;
  ethnicity: keyof typeof ethnicityOptionsEn;
  gender: keyof typeof genderOptionsEn;
  employmentStatus: keyof typeof employmentStatusOptionsEn;
  maritalStatus: keyof typeof maritalStatusOptionsEn;
  firstLanguage: keyof typeof firstLanguageOptionsEn;
};

import { FormInstrument } from '@ddcp/common';

type TranslatedOptions<T> = {
  [K in keyof T]: string;
};

export const ethnicityOptionsEn = {
  white: 'White',
  black: 'Black',
  asian: 'Asian',
  indigenous: 'Indigenous',
  other: 'Other'
};

export const ethnicityOptionsFr: TranslatedOptions<typeof ethnicityOptionsEn> = {
  white: 'Blanc',
  black: 'Noir',
  asian: 'Asiatique',
  indigenous: 'Autochtone',
  other: 'Autre'
};

export const genderOptionsEn = {
  male: 'Male',
  female: 'Female',
  nonBinary: 'Non-Binary'
};

export const genderOptionsFr: TranslatedOptions<typeof genderOptionsEn> = {
  male: 'Masculin',
  female: 'Féminin',
  nonBinary: 'Non-binaire'
};

export const employmentStatusOptionsEn = {
  fullTime: 'Full-Time',
  partTime: 'Part-Time',
  student: 'Student',
  unemployed: 'Unemployed'
};

export const employmentStatusOptionsFr: TranslatedOptions<typeof employmentStatusOptionsEn> = {
  fullTime: 'Emploi à temps plein',
  partTime: 'Emploi à temps partiel',
  student: 'Étudiant',
  unemployed: 'Chômage'
};

export const maritalStatusOptionsEn = {
  married: 'Married (and not separated)',
  widowed: 'Widowed (including living common law)',
  separated: 'Separated (including living common law)',
  divorced: 'Divorced (including living common law)',
  single: 'Single (including living common law)'
};

export const maritalStatusOptionsFr: TranslatedOptions<typeof maritalStatusOptionsEn> = {
  married: 'Marié',
  widowed: 'Widowed (including living common law)',
  separated: 'Séparé (y compris vivant en union libre)',
  divorced: 'Divorcé (y compris vivant en union libre))',
  single: 'Jamais marié (y compris vivant en union libre)'
};

export const firstLanguageOptionsEn = {
  english: 'English',
  french: 'French',
  other: 'Other'
};

export const firstLanguageOptionsFr: TranslatedOptions<typeof firstLanguageOptionsEn> = {
  english: 'Anglais',
  french: 'Français',
  other: 'Autre'
};

export const enhancedDemographicsQuestionnaireEn: FormInstrument<EnhancedDemographicsQuestionnaireData> = {
  kind: 'form',
  name: 'EnhancedDemographicsQuestionnaire',
  version: 1,
  tags: ['Demographics'],
  details: {
    title: 'Enhanced Demographics Questionnaire',
    language: 'en',
    estimatedDuration: 5,
    description:
      'This instrument is designed to capture more specific demographic data, beyond that which is required for initial subject registration',
    instructions:
      'Please provide the most accurate answer for the following questions. If there are more than one correct answers, select the one that is more applicable.'
  },
  content: {
    forwardSortationArea: {
      kind: 'text',
      label: 'Forward Sortation Area',
      variant: 'short',
      description:
        'A forward sortation area (FSA) is a way to designate a geographical unit based on the first three characters in a Canadian postal code. All postal codes that start with the same three characters—for example, K1A—are together considered an FSA.'
    },
    ethnicity: {
      kind: 'options',
      label: 'Ethnicity',
      options: ethnicityOptionsEn
    },
    gender: {
      kind: 'options',
      label: 'Gender Identity',
      options: genderOptionsEn
    },
    employmentStatus: {
      kind: 'options',
      label: 'Employment Status',
      options: employmentStatusOptionsEn
    },
    maritalStatus: {
      kind: 'options',
      label: 'Marital Status',
      options: maritalStatusOptionsEn
    },
    firstLanguage: {
      kind: 'options',
      label: 'First Language',
      options: firstLanguageOptionsEn
    }
  },
  validationSchema: {
    type: 'object',
    properties: {
      forwardSortationArea: {
        type: 'string',
        minLength: 3,
        maxLength: 3
      },
      ethnicity: {
        type: 'string',
        enum: Object.keys(ethnicityOptionsEn) as Array<keyof typeof ethnicityOptionsEn>
      },
      gender: {
        type: 'string',
        enum: Object.keys(genderOptionsEn) as Array<keyof typeof genderOptionsEn>
      },
      employmentStatus: {
        type: 'string',
        enum: Object.keys(employmentStatusOptionsEn) as Array<keyof typeof employmentStatusOptionsEn>
      },
      maritalStatus: {
        type: 'string',
        enum: Object.keys(maritalStatusOptionsEn) as Array<keyof typeof maritalStatusOptionsEn>
      },
      firstLanguage: {
        type: 'string',
        enum: Object.keys(firstLanguageOptionsEn) as Array<keyof typeof firstLanguageOptionsEn>
      }
    },
    required: ['employmentStatus', 'ethnicity', 'firstLanguage', 'forwardSortationArea', 'gender', 'maritalStatus']
  }
};

export const enhancedDemographicsQuestionnaireFr: FormInstrument<EnhancedDemographicsQuestionnaireData> = {
  kind: 'form',
  name: 'EnhancedDemographicsQuestionnaire',
  version: 1,
  tags: ['Demographics'],
  details: {
    title: 'Questionnaire démographique détaillé',
    language: 'fr',
    estimatedDuration: 5,
    description:
      "Cet instrument est conçu pour recueillir des données démographiques plus spécifiques que celles requises pour l'enregistrement initial des sujets. celles qui sont requises pour l'enregistrement initial des sujets",
    instructions:
      "Veuillez fournir la réponse la plus précise aux questions suivantes. S'il y a plusieurs réponses correctes, choisissez celle qui s'applique le mieux."
  },
  content: {
    forwardSortationArea: {
      kind: 'text',
      label: "Région de tri d'acheminement",
      variant: 'short',
      description:
        "Une région de tri d'acheminement (RTA) est une unité géographique désignée par les trois premiers caractères d'un code postal canadien. Tous les codes postaux commençant par les trois mêmes caractères — par exemple, K1A — forment une même RTA."
    },
    ethnicity: {
      kind: 'options',
      label: 'Ethnicité',
      options: ethnicityOptionsFr
    },
    gender: {
      kind: 'options',
      label: 'Identité de genre',
      options: genderOptionsFr
    },
    employmentStatus: {
      kind: 'options',
      label: "Statut de l'emploi",
      options: employmentStatusOptionsFr
    },
    maritalStatus: {
      kind: 'options',
      label: 'État civil',
      options: maritalStatusOptionsFr
    },
    firstLanguage: {
      kind: 'options',
      label: 'Langue maternelle',
      options: firstLanguageOptionsFr
    }
  },
  validationSchema: {
    type: 'object',
    properties: {
      forwardSortationArea: {
        type: 'string',
        minLength: 3,
        maxLength: 3
      },
      ethnicity: {
        type: 'string',
        enum: Object.keys(ethnicityOptionsFr) as Array<keyof typeof ethnicityOptionsFr>
      },
      gender: {
        type: 'string',
        enum: Object.keys(genderOptionsFr) as Array<keyof typeof genderOptionsFr>
      },
      employmentStatus: {
        type: 'string',
        enum: Object.keys(employmentStatusOptionsFr) as Array<keyof typeof employmentStatusOptionsFr>
      },
      maritalStatus: {
        type: 'string',
        enum: Object.keys(maritalStatusOptionsFr) as Array<keyof typeof maritalStatusOptionsFr>
      },
      firstLanguage: {
        type: 'string',
        enum: Object.keys(firstLanguageOptionsFr) as Array<keyof typeof firstLanguageOptionsFr>
      }
    },
    required: ['employmentStatus', 'ethnicity', 'firstLanguage', 'forwardSortationArea', 'gender', 'maritalStatus']
  }
};
*/
