import { createTranslatedForms } from '../utils/create-translated-forms.js';
import { extractKeys, formatOptions } from '../utils/format-options.js';

const employmentStatus = {
  fullTime: {
    en: 'Full-Time',
    fr: 'Temps plein'
  },
  partTime: {
    en: 'Part-Time',
    fr: 'Temps partiel'
  },
  student: {
    en: 'Student',
    fr: 'Étudiant'
  },
  unemployed: {
    en: 'Unemployed',
    fr: 'Au chômage'
  },
  retired: {
    en: 'Retired',
    fr: 'Retraité'
  }
};

const ethnicOrigin = {
  canadian: {
    en: 'Canadian',
    fr: 'Canadien'
  },
  english: {
    en: 'English',
    fr: 'Anglais'
  },
  scottish: {
    en: 'Scottish',
    fr: 'Écossais'
  },
  french: {
    en: 'French',
    fr: 'Français'
  },
  irish: {
    en: 'Irish',
    fr: 'Irlandais'
  },
  german: {
    en: 'German',
    fr: 'Allemand'
  },
  chinese: {
    en: 'Chinese',
    fr: 'Chinois'
  },
  italian: {
    en: 'Italian',
    fr: 'Italien'
  },
  firstNations: {
    en: 'First Nations (North American Indian)',
    fr: "Premières Nations (Indien de l'Amérique du Nord)"
  },
  eastIndian: {
    en: 'East Indian',
    fr: "Indien de l'Inde"
  },
  ukrainian: {
    en: 'Ukrainian',
    fr: 'Ukrainien'
  },
  dutch: {
    en: 'Dutch',
    fr: 'Hollandais'
  },
  polish: {
    en: 'Polish',
    fr: 'Polonais'
  },
  filipino: {
    en: 'Filipino',
    fr: 'Philippin'
  },
  britishIslesOrigins: {
    en: 'British Isles origins, n.i.e.',
    fr: 'Origines des îles britanniques, n.i.a.'
  },
  russian: {
    en: 'Russian',
    fr: 'Russe'
  },
  métis: {
    en: 'Métis',
    fr: 'Métis'
  },
  portuguese: {
    en: 'Portuguese',
    fr: 'Portugais'
  },
  welsh: {
    en: 'Welsh',
    fr: 'Gallois'
  },
  norwegian: {
    en: 'Norwegian',
    fr: 'Norvégien'
  },
  spanish: {
    en: 'Spanish',
    fr: 'Espagnol'
  },
  american: {
    en: 'American',
    fr: 'Américain'
  },
  swedish: {
    en: 'Swedish',
    fr: 'Suédois'
  },
  hungarian: {
    en: 'Hungarian',
    fr: 'Hongrois'
  },
  jamaican: {
    en: 'Jamaican',
    fr: 'Jamaïquain'
  },
  greek: {
    en: 'Greek',
    fr: 'Grec'
  },
  vietnamese: {
    en: 'Vietnamese',
    fr: 'Vietnamien'
  },
  romanian: {
    en: 'Romanian',
    fr: 'Roumain'
  },
  lebanese: {
    en: 'Lebanese',
    fr: 'Libanais'
  },
  pakistani: {
    en: 'Pakistani',
    fr: 'Pakistanais'
  },
  otherAfricanOrigins: {
    en: 'Other African origins, n.i.e.',
    fr: 'Autres origines africaines, n.i.a.'
  },
  iranian: {
    en: 'Iranian',
    fr: 'Iranien'
  },
  danish: {
    en: 'Danish',
    fr: 'Danois'
  },
  austrian: {
    en: 'Austrian',
    fr: 'Autrichien'
  },
  korean: {
    en: 'Korean',
    fr: 'Coréen'
  },
  québécois: {
    en: 'Québécois',
    fr: 'Québécois'
  },
  belgian: {
    en: 'Belgian',
    fr: 'Belge'
  },
  haitian: {
    en: 'Haitian',
    fr: 'Haïtien'
  },
  swiss: {
    en: 'Swiss',
    fr: 'Suisse'
  },
  sriLankan: {
    en: 'Sri Lankan',
    fr: 'Sri-Lankais'
  },
  jewish: {
    en: 'Jewish',
    fr: 'Juif'
  },
  finnish: {
    en: 'Finnish',
    fr: 'Finlandais'
  },
  croatian: {
    en: 'Croatian',
    fr: 'Croate'
  },
  mexican: {
    en: 'Mexican',
    fr: 'Mexicain'
  },
  japanese: {
    en: 'Japanese',
    fr: 'Japonais'
  },
  acadian: {
    en: 'Acadian',
    fr: 'Acadien'
  },
  punjabi: {
    en: 'Punjabi',
    fr: 'Pendjabi'
  },
  arab: {
    en: 'Arab, n.o.s.',
    fr: 'Arabe, n.d.a.'
  },
  czech: {
    en: 'Czech',
    fr: 'Tchèque'
  },
  moroccan: {
    en: 'Moroccan',
    fr: 'Marocain'
  },
  icelandic: {
    en: 'Icelandic',
    fr: 'Islandais'
  },
  egyptian: {
    en: 'Egyptian',
    fr: 'Égyptien'
  },
  serbian: {
    en: 'Serbian',
    fr: 'Serbe'
  },
  colombian: {
    en: 'Colombian',
    fr: 'Colombien'
  },
  guyanese: {
    en: 'Guyanese',
    fr: 'Guyanais'
  },
  afghan: {
    en: 'Afghan',
    fr: 'Afghan'
  },
  inuit: {
    en: 'Inuit',
    fr: 'Inuit'
  },
  trinidadianTobagonian: {
    en: 'Trinidadian/Tobagonian',
    fr: 'Trinidadien/Tobagonien'
  },
  syrian: {
    en: 'Syrian',
    fr: 'Syrien'
  },
  southAsianOrigins: {
    en: 'South Asian origins, n.i.e.',
    fr: 'Origines sud-asiatiques, n.i.a.'
  },
  slovak: {
    en: 'Slovak',
    fr: 'Slovaque'
  },
  iraqi: {
    en: 'Iraqi',
    fr: 'Irakien'
  },
  westIndian: {
    en: 'West Indian, n.o.s.',
    fr: 'Antillais Britannique, n.d.a.'
  },
  otherEuropeanOrigins: {
    en: 'Other European origins, n.i.e.',
    fr: 'Autres origines européennes, n.i.a.'
  },
  algerian: {
    en: 'Algerian',
    fr: 'Algérien'
  },
  salvadorean: {
    en: 'Salvadorean',
    fr: 'Salvadorien'
  },
  turk: {
    en: 'Turk',
    fr: 'Turc'
  },
  armenian: {
    en: 'Armenian',
    fr: 'Arménien'
  },
  somali: {
    en: 'Somali',
    fr: 'Somalien'
  },
  lithuanian: {
    en: 'Lithuanian',
    fr: 'Lituanien'
  },
  northernEuropeanOrigins: {
    en: 'Northern European origins, n.i.e.',
    fr: "Origines d'Europe du Nord, n.i.a."
  },
  nigerian: {
    en: 'Nigerian',
    fr: 'Nigérian'
  },
  tamil: {
    en: 'Tamil',
    fr: 'Tamoul'
  },
  bangladeshi: {
    en: 'Bangladeshi',
    fr: 'Bangladeshi'
  },
  chilean: {
    en: 'Chilean',
    fr: 'Chilien'
  },
  palestinian: {
    en: 'Palestinian',
    fr: 'Palestinien'
  },
  ethiopian: {
    en: 'Ethiopian',
    fr: 'Éthiopien'
  },
  macedonian: {
    en: 'Macedonian',
    fr: 'Macédonien'
  },
  australian: {
    en: 'Australian',
    fr: 'Australien'
  },
  peruvian: {
    en: 'Peruvian',
    fr: 'Péruvien'
  },
  maltese: {
    en: 'Maltese',
    fr: 'Maltais'
  },
  southAfrican: {
    en: 'South African',
    fr: 'Sud-Africain'
  },
  czechoslovakian: {
    en: 'Czechoslovakian, n.o.s.',
    fr: 'Tchécoslovaque, n.d.a.'
  },
  slovenian: {
    en: 'Slovenian',
    fr: 'Slovène'
  },
  cambodian: {
    en: 'Cambodian (Khmer)',
    fr: 'Cambodgien (Khmer)'
  },
  yugoslavian: {
    en: 'Yugoslavian, n.o.s.',
    fr: 'Yougoslave, n.d.a.'
  },
  congolese: {
    en: 'Congolese',
    fr: 'Congolais'
  },
  barbadian: {
    en: 'Barbadian',
    fr: 'Barbadien'
  },
  berber: {
    en: 'Berber',
    fr: 'Berbère'
  },
  brazilian: {
    en: 'Brazilian',
    fr: 'Brésilien'
  },
  taiwanese: {
    en: 'Taiwanese',
    fr: 'Taïwanais'
  },
  albanian: {
    en: 'Albanian',
    fr: 'Albanais'
  },
  ghanaian: {
    en: 'Ghanaian',
    fr: 'Ghanéen'
  },
  bulgarian: {
    en: 'Bulgarian',
    fr: 'Bulgare'
  },
  latvian: {
    en: 'Latvian',
    fr: 'Letton'
  },
  black: {
    en: 'Black, n.o.s.',
    fr: 'Noir, n.d.a.'
  },
  cuban: {
    en: 'Cuban',
    fr: 'Cubain'
  },
  israeli: {
    en: 'Israeli',
    fr: 'Israélien'
  },
  latinCentralAndSouthAmericanOrigins: {
    en: 'Latin, Central and South American origins, n.i.e.',
    fr: "Origines de l'Amérique latine, centrale et du Sud, n.i.a."
  },
  caribbeanOrigins: {
    en: 'Caribbean origins, n.i.e.',
    fr: 'Origines des Caraïbes, n.i.a.'
  },
  mixed: {
    en: 'Mixed origin',
    fr: 'Origine mixte'
  }
};

const firstLanguage = {
  english: {
    en: 'English',
    fr: 'Anglais'
  },
  french: {
    en: 'French',
    fr: 'Français'
  },
  other: {
    en: 'Other',
    fr: 'Autre'
  }
};

const gender = {
  male: {
    en: 'Man',
    fr: 'Homme'
  },
  female: {
    en: 'Woman',
    fr: 'Femme'
  },
  nonBinary: {
    en: 'Non-Binary',
    fr: 'Non-binaire'
  }
};

const maritalStatus = {
  married: {
    en: 'Married',
    fr: 'Marié'
  },
  commonLaw: {
    en: 'Living common law',
    fr: 'Vivant en union libre'
  },
  neverMarried: {
    en: 'Never married (not living common law)',
    fr: 'Jamais marié (ne vivant pas en union libre)'
  },
  separated: {
    en: 'Separated (not living common law)',
    fr: 'Séparé (ne vivant pas en union libre)'
  },
  divorced: {
    en: 'Divorced (not living common law)',
    fr: 'Divorcé (ne vivant pas en union libre)'
  },
  widowed: {
    en: 'Widowed (not living common law)',
    fr: 'Veuf (ne vivant pas en union libre)'
  }
};

const religion = {
  buddhist: {
    en: 'Buddhist',
    fr: 'Bouddhiste'
  },
  christian: {
    en: 'Christian',
    fr: 'Chrétienne'
  },
  hindu: {
    en: 'Hindu',
    fr: 'Hindoue'
  },
  jewish: {
    en: 'Jewish',
    fr: 'Juive'
  },
  muslim: {
    en: 'Muslim',
    fr: 'Musulmane'
  },
  sikh: {
    en: 'Sikh',
    fr: 'Sikhe'
  },
  indigenous: {
    en: 'Traditional (North American Indigenous) spirituality',
    fr: "Spiritualité traditionnelle (Autochtone d'Amérique du Nord)"
  },
  other: {
    en: 'Other religions and spiritual traditions',
    fr: 'Autres traditions religieuses et spirituelles'
  },
  none: {
    en: 'No religion and secular perspectives',
    fr: 'Aucune religion et perspectives séculières'
  },
  agnostic: {
    en: 'Agnostic',
    fr: 'Agnostique'
  }
};

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
      en: 'This instrument is designed to capture more specific demographic data, beyond that which is required for initial subject registration. All questions are optional.',
      fr: "Cet instrument est conçu pour recueillir des données démographiques plus spécifiques que celles requises pour l'enregistrement initial des sujets. celles qui sont requises pour l'enregistrement initial des sujets. Toutes les questions sont optionnelles."
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
