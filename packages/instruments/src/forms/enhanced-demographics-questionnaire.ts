/* eslint-disable perfectionist/sort-objects */

type MultilingualOptions = Record<
  string,
  {
    [L in Language]: string;
  }
>;

type TranslatedOptions<T extends MultilingualOptions> = {
  [K in keyof T]: string;
};

type FormattedOptions<T extends MultilingualOptions> = {
  [L in Language]: {
    [K in keyof T]: string;
  };
};

function translateOptions<T extends MultilingualOptions>(options: T, language: Language): TranslatedOptions<T> {
  const translatedOptions: Partial<TranslatedOptions<T>> = {};
  for (const option in options) {
    translatedOptions[option] = options[option]?.[language];
  }
  return translatedOptions as TranslatedOptions<T>;
}

/** Transform multilingual options to options for a multilingual instrument */
 function formatTranslatedOptions<T extends MultilingualOptions>(options: T): FormattedOptions<T> {  return {
    en: translateOptions(options, 'en'),
    fr: translateOptions(options, 'fr')
  };
}

function extractKeysAsTuple<T extends Record<string, unknown>>(options: T) {
  return Object.keys(options) as [keyof T, ...(keyof T)[]];
}

const employmentStatus = {
  fullTime: {
    en: 'Full-Time',
    fr: 'Temps plein'
  },
  partTime: {
    en: 'Part-Time',
    fr: 'Temps partiel'
  },
  retired: {
    en: 'Retired',
    fr: 'Retraité'
  },
  student: {
    en: 'Student',
    fr: 'Étudiant'
  },
  unemployed: {
    en: 'Unemployed',
    fr: 'Au chômage'
  }
};

const ethnicOrigin = {
  acadian: {
    en: 'Acadian',
    fr: 'Acadien'
  },
  afghan: {
    en: 'Afghan',
    fr: 'Afghan'
  },
  albanian: {
    en: 'Albanian',
    fr: 'Albanais'
  },
  algerian: {
    en: 'Algerian',
    fr: 'Algérien'
  },
  american: {
    en: 'American',
    fr: 'Américain'
  },
  arab: {
    en: 'Arab, n.o.s.',
    fr: 'Arabe, n.d.a.'
  },
  armenian: {
    en: 'Armenian',
    fr: 'Arménien'
  },
  australian: {
    en: 'Australian',
    fr: 'Australien'
  },
  austrian: {
    en: 'Austrian',
    fr: 'Autrichien'
  },
  bangladeshi: {
    en: 'Bangladeshi',
    fr: 'Bangladeshi'
  },
  barbadian: {
    en: 'Barbadian',
    fr: 'Barbadien'
  },
  belgian: {
    en: 'Belgian',
    fr: 'Belge'
  },
  berber: {
    en: 'Berber',
    fr: 'Berbère'
  },
  black: {
    en: 'Black, n.o.s.',
    fr: 'Noir, n.d.a.'
  },
  brazilian: {
    en: 'Brazilian',
    fr: 'Brésilien'
  },
  britishIslesOrigins: {
    en: 'British Isles origins, n.i.e.',
    fr: 'Origines des îles britanniques, n.i.a.'
  },
  bulgarian: {
    en: 'Bulgarian',
    fr: 'Bulgare'
  },
  cambodian: {
    en: 'Cambodian (Khmer)',
    fr: 'Cambodgien (Khmer)'
  },
  canadian: {
    en: 'Canadian',
    fr: 'Canadien'
  },
  caribbeanOrigins: {
    en: 'Caribbean origins, n.i.e.',
    fr: 'Origines des Caraïbes, n.i.a.'
  },
  chilean: {
    en: 'Chilean',
    fr: 'Chilien'
  },
  chinese: {
    en: 'Chinese',
    fr: 'Chinois'
  },
  colombian: {
    en: 'Colombian',
    fr: 'Colombien'
  },
  congolese: {
    en: 'Congolese',
    fr: 'Congolais'
  },
  croatian: {
    en: 'Croatian',
    fr: 'Croate'
  },
  cuban: {
    en: 'Cuban',
    fr: 'Cubain'
  },
  czech: {
    en: 'Czech',
    fr: 'Tchèque'
  },
  czechoslovakian: {
    en: 'Czechoslovakian, n.o.s.',
    fr: 'Tchécoslovaque, n.d.a.'
  },
  danish: {
    en: 'Danish',
    fr: 'Danois'
  },
  dutch: {
    en: 'Dutch',
    fr: 'Hollandais'
  },
  eastIndian: {
    en: 'East Indian',
    fr: "Indien de l'Inde"
  },
  egyptian: {
    en: 'Egyptian',
    fr: 'Égyptien'
  },
  english: {
    en: 'English',
    fr: 'Anglais'
  },
  ethiopian: {
    en: 'Ethiopian',
    fr: 'Éthiopien'
  },
  filipino: {
    en: 'Filipino',
    fr: 'Philippin'
  },
  finnish: {
    en: 'Finnish',
    fr: 'Finlandais'
  },
  firstNations: {
    en: 'First Nations (North American Indian)',
    fr: "Premières Nations (Indien de l'Amérique du Nord)"
  },
  french: {
    en: 'French',
    fr: 'Français'
  },
  german: {
    en: 'German',
    fr: 'Allemand'
  },
  ghanaian: {
    en: 'Ghanaian',
    fr: 'Ghanéen'
  },
  greek: {
    en: 'Greek',
    fr: 'Grec'
  },
  guyanese: {
    en: 'Guyanese',
    fr: 'Guyanais'
  },
  haitian: {
    en: 'Haitian',
    fr: 'Haïtien'
  },
  hungarian: {
    en: 'Hungarian',
    fr: 'Hongrois'
  },
  icelandic: {
    en: 'Icelandic',
    fr: 'Islandais'
  },
  inuit: {
    en: 'Inuit',
    fr: 'Inuit'
  },
  iranian: {
    en: 'Iranian',
    fr: 'Iranien'
  },
  iraqi: {
    en: 'Iraqi',
    fr: 'Irakien'
  },
  irish: {
    en: 'Irish',
    fr: 'Irlandais'
  },
  israeli: {
    en: 'Israeli',
    fr: 'Israélien'
  },
  italian: {
    en: 'Italian',
    fr: 'Italien'
  },
  jamaican: {
    en: 'Jamaican',
    fr: 'Jamaïquain'
  },
  japanese: {
    en: 'Japanese',
    fr: 'Japonais'
  },
  jewish: {
    en: 'Jewish',
    fr: 'Juif'
  },
  korean: {
    en: 'Korean',
    fr: 'Coréen'
  },
  latinCentralAndSouthAmericanOrigins: {
    en: 'Latin, Central and South American origins, n.i.e.',
    fr: "Origines de l'Amérique latine, centrale et du Sud, n.i.a."
  },
  latvian: {
    en: 'Latvian',
    fr: 'Letton'
  },
  lebanese: {
    en: 'Lebanese',
    fr: 'Libanais'
  },
  lithuanian: {
    en: 'Lithuanian',
    fr: 'Lituanien'
  },
  macedonian: {
    en: 'Macedonian',
    fr: 'Macédonien'
  },
  maltese: {
    en: 'Maltese',
    fr: 'Maltais'
  },
  mexican: {
    en: 'Mexican',
    fr: 'Mexicain'
  },
  mixed: {
    en: 'Mixed origin',
    fr: 'Origine mixte'
  },
  moroccan: {
    en: 'Moroccan',
    fr: 'Marocain'
  },
  métis: {
    en: 'Métis',
    fr: 'Métis'
  },
  nigerian: {
    en: 'Nigerian',
    fr: 'Nigérian'
  },
  northernEuropeanOrigins: {
    en: 'Northern European origins, n.i.e.',
    fr: "Origines d'Europe du Nord, n.i.a."
  },
  norwegian: {
    en: 'Norwegian',
    fr: 'Norvégien'
  },
  otherAfricanOrigins: {
    en: 'Other African origins, n.i.e.',
    fr: 'Autres origines africaines, n.i.a.'
  },
  otherEuropeanOrigins: {
    en: 'Other European origins, n.i.e.',
    fr: 'Autres origines européennes, n.i.a.'
  },
  pakistani: {
    en: 'Pakistani',
    fr: 'Pakistanais'
  },
  palestinian: {
    en: 'Palestinian',
    fr: 'Palestinien'
  },
  peruvian: {
    en: 'Peruvian',
    fr: 'Péruvien'
  },
  polish: {
    en: 'Polish',
    fr: 'Polonais'
  },
  portuguese: {
    en: 'Portuguese',
    fr: 'Portugais'
  },
  punjabi: {
    en: 'Punjabi',
    fr: 'Pendjabi'
  },
  québécois: {
    en: 'Québécois',
    fr: 'Québécois'
  },
  romanian: {
    en: 'Romanian',
    fr: 'Roumain'
  },
  russian: {
    en: 'Russian',
    fr: 'Russe'
  },
  salvadorean: {
    en: 'Salvadorean',
    fr: 'Salvadorien'
  },
  scottish: {
    en: 'Scottish',
    fr: 'Écossais'
  },
  serbian: {
    en: 'Serbian',
    fr: 'Serbe'
  },
  slovak: {
    en: 'Slovak',
    fr: 'Slovaque'
  },
  slovenian: {
    en: 'Slovenian',
    fr: 'Slovène'
  },
  somali: {
    en: 'Somali',
    fr: 'Somalien'
  },
  southAfrican: {
    en: 'South African',
    fr: 'Sud-Africain'
  },
  southAsianOrigins: {
    en: 'South Asian origins, n.i.e.',
    fr: 'Origines sud-asiatiques, n.i.a.'
  },
  spanish: {
    en: 'Spanish',
    fr: 'Espagnol'
  },
  sriLankan: {
    en: 'Sri Lankan',
    fr: 'Sri-Lankais'
  },
  swedish: {
    en: 'Swedish',
    fr: 'Suédois'
  },
  swiss: {
    en: 'Swiss',
    fr: 'Suisse'
  },
  syrian: {
    en: 'Syrian',
    fr: 'Syrien'
  },
  taiwanese: {
    en: 'Taiwanese',
    fr: 'Taïwanais'
  },
  tamil: {
    en: 'Tamil',
    fr: 'Tamoul'
  },
  trinidadianTobagonian: {
    en: 'Trinidadian/Tobagonian',
    fr: 'Trinidadien/Tobagonien'
  },
  turk: {
    en: 'Turk',
    fr: 'Turc'
  },
  ukrainian: {
    en: 'Ukrainian',
    fr: 'Ukrainien'
  },
  vietnamese: {
    en: 'Vietnamese',
    fr: 'Vietnamien'
  },
  welsh: {
    en: 'Welsh',
    fr: 'Gallois'
  },
  westIndian: {
    en: 'West Indian, n.o.s.',
    fr: 'Antillais Britannique, n.d.a.'
  },
  yugoslavian: {
    en: 'Yugoslavian, n.o.s.',
    fr: 'Yougoslave, n.d.a.'
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
  female: {
    en: 'Woman',
    fr: 'Femme'
  },
  male: {
    en: 'Man',
    fr: 'Homme'
  },
  nonBinary: {
    en: 'Non-Binary',
    fr: 'Non-binaire'
  }
};

const maritalStatus = {
  commonLaw: {
    en: 'Living common law',
    fr: 'Vivant en union libre'
  },
  divorced: {
    en: 'Divorced (not living common law)',
    fr: 'Divorcé (ne vivant pas en union libre)'
  },
  married: {
    en: 'Married',
    fr: 'Marié'
  },
  neverMarried: {
    en: 'Never married (not living common law)',
    fr: 'Jamais marié (ne vivant pas en union libre)'
  },
  separated: {
    en: 'Separated (not living common law)',
    fr: 'Séparé (ne vivant pas en union libre)'
  },
  widowed: {
    en: 'Widowed (not living common law)',
    fr: 'Veuf (ne vivant pas en union libre)'
  }
};

const religion = {
  agnostic: {
    en: 'Agnostic',
    fr: 'Agnostique'
  },
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
  indigenous: {
    en: 'Traditional (North American Indigenous) spirituality',
    fr: "Spiritualité traditionnelle (Autochtone d'Amérique du Nord)"
  },
  jewish: {
    en: 'Jewish',
    fr: 'Juive'
  },
  muslim: {
    en: 'Muslim',
    fr: 'Musulmane'
  },
  none: {
    en: 'No religion and secular perspectives',
    fr: 'Aucune religion et perspectives séculières'
  },
  other: {
    en: 'Other religions and spiritual traditions',
    fr: 'Autres traditions religieuses et spirituelles'
  },
  sikh: {
    en: 'Sikh',
    fr: 'Sikhe'
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
    f: 'No',
    t: 'Yes'
  },
  fr: {
    f: 'Non',
    t: 'Oui'
  }
} as const;

type EnhancedDemographicsQuestionnaireData = {
  ageAtImmigration?: number;
  // Economic
  annualIncome?: number;
  employmentStatus?: EmploymentStatus;

  ethnicOrigin?: EthnicOrigin;
  // Language
  firstLanguage?: FirstLanguage;
  // Personal Characteristics
  gender?: Gender;

  householdSize?: number;
  // Immigration
  isCanadianCitizen?: boolean;
  maritalStatus?: MartialStatus;
  numberChildren?: number;

  // Living Situation
  postalCode?: string;
  religion?: Religion;

  speaksEnglish?: boolean;

  speaksFrench?: boolean;
  // Education
  yearsOfEducation?: number;
};

const enhancedDemographicsQuestionnaire: FormInstrument<EnhancedDemographicsQuestionnaireData, InstrumentLanguage> = {
  kind: 'form',
  name: 'EnhancedDemographicsQuestionnaire',
  language: ['en', 'fr'],
  tags: {
    en: ['Demographics'],
    fr: ['Démographie']
  },
  version: 1,
  content: [
    {
      fields: {
        ethnicOrigin: {
          kind: 'options',
          label: {
            en: 'Ethnic Origin',
            fr: 'Origine ethnique'
          },
          options: formatTranslatedOptions(ethnicOrigin)
        },
        gender: {
          kind: 'options',
          label: {
            en: 'Gender Identity',
            fr: 'Identité de genre'
          },
          options: formatTranslatedOptions(gender)
        },
        religion: {
          kind: 'options',
          label: {
            en: 'Religion',
            fr: 'Religion'
          },
          options: formatTranslatedOptions(religion)
        }
      },
      title: {
        en: 'Personal Characteristics',
        fr: 'Caractéristiques individuelles'
      }
    },
    {
      fields: {
        firstLanguage: {
          kind: 'options',
          label: {
            en: 'First Language',
            fr: 'Langue maternelle'
          },
          options: formatTranslatedOptions(firstLanguage)
        },
        speaksEnglish: {
          kind: 'binary',
          label: {
            en: 'Speak and Understand English',
            fr: "Parler et comprendre l'anglais"
          },
          options: yesNoOptions,
          variant: 'radio'
        },
        speaksFrench: {
          kind: 'binary',
          label: {
            en: 'Speak and Understand French',
            fr: 'Parler et comprendre le français'
          },
          options: yesNoOptions,
          variant: 'radio'
        }
      },
      title: {
        en: 'Language',
        fr: 'Langue'
      }
    },
    {
      fields: {
        householdSize: {
          kind: 'numeric',
          label: {
            en: 'Household Size',
            fr: 'Taille du ménage'
          },
          max: 20,
          min: 0,
          variant: 'default'
        },
        maritalStatus: {
          kind: 'options',
          label: {
            en: 'Martial Status',
            fr: 'État matrimonial'
          },
          options: formatTranslatedOptions(maritalStatus)
        },
        numberChildren: {
          kind: 'numeric',
          label: {
            en: 'Number of Children',
            fr: "Nombre d'enfants"
          },
          max: 20,
          min: 0,
          variant: 'default'
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
      title: {
        en: 'Living Situation',
        fr: 'Situation de vie'
      }
    },
    {
      fields: {
        annualIncome: {
          kind: 'numeric',
          label: {
            en: 'Annual Income',
            fr: 'Revenu annuel'
          },
          max: 1000000,
          min: 0,
          variant: 'default'
        },
        employmentStatus: {
          kind: 'options',
          label: {
            en: 'Employment Status',
            fr: "Statut de l'emploi"
          },
          options: formatTranslatedOptions(employmentStatus)
        }
      },
      title: {
        en: 'Economic Situation',
        fr: 'Situation économique'
      }
    },
    {
      fields: {
        yearsOfEducation: {
          kind: 'numeric',
          label: {
            en: 'Years of Education',
            fr: "Années d'études"
          },
          max: 30,
          min: 0,
          variant: 'default'
        }
      },
      title: {
        en: 'Education',
        fr: 'Éducation'
      }
    },
    {
      fields: {
        ageAtImmigration: {
          kind: 'numeric',
          label: {
            en: 'Age at Immigration',
            fr: "Âge à l'immigration (le cas échéant)"
          },
          max: 100,
          min: 1,
          variant: 'default'
        },
        isCanadianCitizen: {
          kind: 'binary',
          label: {
            en: 'Canadian Citizen',
            fr: 'Citoyen canadien'
          },
          options: yesNoOptions,
          variant: 'radio'
        }
      },
      title: {
        en: 'Immigration',
        fr: 'Immigration'
      }
    }
  ],
  details: {
    description: {
      en: 'This instrument is designed to capture more specific demographic data, beyond that which is required for initial subject registration. All questions are optional.',
      fr: "Cet instrument est conçu pour recueillir des données démographiques plus spécifiques que celles requises pour l'enregistrement initial des sujets. celles qui sont requises pour l'enregistrement initial des sujets. Toutes les questions sont optionnelles."
    },
    estimatedDuration: 5,
    instructions: {
      en: 'Please provide the most accurate answer for the following questions. If there are more than one correct answers, select the one that is more applicable.',
      fr: "Veuillez fournir la réponse la plus précise aux questions suivantes. S'il y a plusieurs réponses correctes, choisissez celle qui s'applique le mieux."
    },
    title: {
      en: 'Enhanced Demographics Questionnaire',
      fr: 'Questionnaire démographique détaillé'
    }
  },
  validationSchema: z
    .object({
      ageAtImmigration: z.number().int().gte(1).lte(100),
      annualIncome: z.number().int().gte(0).lte(1000000),
      employmentStatus: z.enum(extractKeysAsTuple(employmentStatus)),
      ethnicOrigin: z.enum(extractKeysAsTuple(ethnicOrigin)),
      firstLanguage: z.enum(extractKeysAsTuple(firstLanguage)),
      gender: z.enum(extractKeysAsTuple(gender)),
      householdSize: z.number().int().gte(0).lte(20),
      isCanadianCitizen: z.boolean(),
      maritalStatus: z.enum(extractKeysAsTuple(maritalStatus)),
      numberChildren: z.number().int().gte(0).lte(20),
      postalCode: z.string().regex(new RegExp('^[A-Z]\\d[A-Z][ -]?\\d[A-Z]\\d$')),
      religion: z.enum(extractKeysAsTuple(religion)),
      speaksEnglish: z.boolean(),
      speaksFrench: z.boolean(),
      yearsOfEducation: z.number().int().gte(0).lte(30)
    })
    .partial()
};

export default enhancedDemographicsQuestionnaire;
