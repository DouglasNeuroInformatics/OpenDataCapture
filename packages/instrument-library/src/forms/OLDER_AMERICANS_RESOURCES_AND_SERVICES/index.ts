import { defineInstrument } from '/runtime/v1/@opendatacapture/runtime-core';
import { z } from '/runtime/v1/zod@3.x';

export default defineInstrument({
  kind: 'FORM',
  language: ['en', 'fr'],
  internal: {
    name: 'OLDER_AMERICANS_RESOURCES_AND_SERVICES',
    edition: 1
  },
  tags: {
    en: ['social'],
    fr: ['social']
  },
  content: {
    peopleYouKnowCanVisitTheirHome: {
      kind: 'string',
      variant: 'radio',
      label: {
        en: 'How many people do you know well enough to visit within their homes?',
        fr: 'Combien de personnes connaissez-vous assez bien pour leur rendre visite chez elles?'
      },
      options: {
        en: {
          'five or more': 'five or more',
          'three to four': 'three to four',
          'one to two': 'one to two',
          none: 'none',
          'prefer not to answer': 'prefer not to answer'
        },
        fr: {
          'five or more': 'cinq ou plus',
          'three to four': 'trois ou quatre',
          'one to two': 'une ou deux',
          none: 'personne',
          'prefer not to answer': 'préfère ne pas répondre'
        }
      }
    },
    numbersOfCallsLastWeek: {
      kind: 'string',
      variant: 'radio',
      label: {
        en: 'About how many times did you talk to someone (friends, relatives, or others) on the telephone in the past week? (either you called them or they called you) If you do not have a phone, the question still applies.',
        fr: "Combien de conversations téléphoniques avez-vous eues avec des amis, des membres de votre famille ou autres pendant la dernière semaine? (leur avez-vous téléphoné ou vous ont-ils téléphoné) La question s'applique même si vous n'avez pas de téléphone."
      },
      options: {
        en: {
          'once a day or more': 'once a day or more',
          '2 - 6 times': '2 - 6 times',
          once: 'once',
          'not at all': 'not at all',
          'prefer not to answer': 'prefer not to answer'
        },
        fr: {
          'once a day or more': 'une fois par jour ou plus',
          '2 - 6 times': 'de deux à six',
          once: 'une',
          'not at all': 'aucune',
          'prefer not to answer': 'préfère ne pas répondre'
        }
      }
    },
    numbersOfTimeSpentWithSomeoneLastWeek: {
      kind: 'string',
      variant: 'radio',
      label: {
        en: 'How many times during the past week did you spend some time with someone who does not live with you, that is you went to see them or they came to visit you or you went out to do things together?',
        fr: "Combien de fois pendant la dernière semaine avez-vous passé du temps avec une personne qui n'habite pas avec vous, c'est à dire que vous lui avez rendu visite ou qu'elle vous a rendu visite ou encore que vous êtes sortis ensemble pour faire quelque chose?"
      },
      options: {
        en: {
          'once a day or more': 'once a day or more',
          '2 - 6 times': '2 - 6 times',
          once: 'once',
          'not at all': 'not at all',
          'prefer not to answer': 'prefer not to answer'
        },
        fr: {
          'once a day or more': 'une fois par jour ou plus',
          '2 - 6 times': 'de deux à six',
          once: 'une',
          'not at all': 'aucune',
          'prefer not to answer': 'préfère ne pas répondre'
        }
      }
    },
    haveSomeoneYouTrust: {
      kind: 'string',
      variant: 'radio',
      label: {
        en: 'Do you have someone you trust and can confide in?',
        fr: 'Y a-t-il une personne en qui vous avez confiance et à laquelle vous pouvez-vous confier?'
      },
      options: {
        en: {
          yes: 'yes',
          no: 'no',
          'prefer not to answer': 'prefer not to answer'
        },
        fr: {
          yes: 'oui',
          no: 'non',
          'prefer not to answer': 'préfère ne pas répondre'
        }
      }
    },
    doYouFeelLonely: {
      kind: 'string',
      variant: 'radio',
      label: {
        en: 'Do you find yourself feeling lonely quite often, sometimes or almost never?',
        fr: 'Vous sentez-vous seul(e) assez souvent quelquefois ou presque jamais?'
      },
      options: {
        en: {
          'quite often': 'quite often',
          sometimes: 'sometimes',
          'almost never': 'almost never',
          'prefer not to answer': 'prefer not to answer'
        },
        fr: {
          'quite often': 'assez souvent',
          sometimes: 'quelquefois',
          'almost never': 'presque jamais',
          'prefer not to answer': 'préfère ne pas répondre'
        }
      }
    },
    seeFriendsAndRelativesAsYouWant: {
      kind: 'string',
      variant: 'radio',
      label: {
        en: 'Do you see your relatives and friends as often as you want to or are you somewhat unhappy about how little you see them?',
        fr: 'Voyez-vous votre famille et vos amis aussi souvent que vous le désirez, ou êtes-vous plutôt insatisfait(e) que vous les voyez rarement?'
      },
      options: {
        en: {
          'as often as wants to': 'as often as wants to',
          'somewhat unhappy about how little': 'somewhat unhappy about how little',
          'prefer not to answer': 'prefer not to answer'
        },
        fr: {
          'as often as wants to': 'aussi souvent que je le desire',
          'somewhat unhappy about how little': 'plutôt insatisfait(e) que je les vois rarement',
          'prefer not to answer': 'préfère ne pas répondre'
        }
      }
    },
    someoneTakeCareOfYouWhenNeeded: {
      kind: 'string',
      variant: 'radio',
      label: {
        en: 'Do you have someone you trust and can confide in?',
        fr: 'Y a-t-il une personne en qui vous avez confiance et à laquelle vous pouvez-vous confier?'
      },
      options: {
        en: {
          yes: 'yes',
          'no one willing and able': 'no one willing and able',
          'prefer not to answer': 'prefer not to answer'
        },
        fr: {
          yes: 'oui',
          'no one willing and able': "il n'y a personne qui disposerait ou qui soit en mesure de m'aider",
          'prefer not to answer': 'préfère ne pas répondre'
        }
      }
    },
    someoneTakeCareOfYouAsLongAsYouNeed: {
      kind: 'dynamic',
      deps: ['someoneTakeCareOfYouWhenNeeded'],
      render: (data) => {
        return data?.someoneTakeCareOfYouWhenNeeded === 'yes'
          ? {
              kind: 'string',
              variant: 'radio',
              label: {
                en: 'Is there someone who would take care of you as long as you needed, or only for a short time, or only someone who would help you now and then (for example, taking you to the doctor or fixing lunch occasionally, etc.)?',
                fr: "Y a-t-il une personne qui prendrait soin de vous aussi longtemps qu'il le faudrait une courte période, ou qui vous aiderait de temps en temps seulement, par exemple, une personne qui vous conduirait chez le médcin ou vous ferait à déjeuner occasionnellement, etc."
              },
              options: {
                en: {
                  'Someone who would take care of you indefinitely (as long as needed)':
                    'Someone who would take care of you indefinitely (as long as needed)',
                  'Someone who would take care of you for a short time (a few weeks to six months)':
                    'Someone who would take care of you for a short time (a few weeks to six months)',
                  'Someone who would help you now and then (taking you to the doctor, fixing lunch, etc.)':
                    'Someone who would help you now and then (taking you to the doctor, fixing lunch, etc.)',
                  'prefer not to answer': 'prefer not to answer'
                },
                fr: {
                  'Someone who would take care of you indefinitely (as long as needed)':
                    "une personne qui prendrait soin de vous indéfiniment (aussi longtemps qu'il le faudrait)",
                  'Someone who would take care of you for a short time (a few weeks to six months)':
                    'une personne qui prendrait soin de vous pendant une courte période (de quelques semaines à six mois)',
                  'Someone who would help you now and then (taking you to the doctor, fixing lunch, etc.)':
                    'une personne qui vous aiderait de temps en temps (qui vous conduirait chez le médecin ou vous ferait à déjeuner, etc.)',
                  'prefer not to answer': 'préfère ne pas répondre'
                }
              }
            }
          : null;
      }
    }
  },
  details: {
    description: {
      en: 'Social Support: Now, we will ask you some questions about your family and friends. Reference: https://osf.io/94qv5/',
      fr: 'Soutien social: Nous allons maintenant vous poser quelques questions concernant votre famille et vos amis. Référence: https://osf.io/94qv5/'
    },
    estimatedDuration: 3,
    instructions: {
      en: ['Now, I would like to ask you some questions about your family and friends. Please complete all questions.'],
      fr: [
        "Maintenant, j'aimerais vous poser quelques questions sur votre famille et vos amis. Veuillez répondre à toutes les questions."
      ]
    },
    license: 'CC-BY-4.0',
    title: {
      en: 'Older Americans Resources and Services Social Resource Scale',
      fr: 'Réseau social'
    }
  },
  validationSchema: z.object({
    peopleYouKnowCanVisitTheirHome: z.enum([
      'five or more',
      'three to four',
      'one to two',
      'none',
      'prefer not to answer'
    ]),
    numbersOfCallsLastWeek: z.enum(['once a day or more', '2 - 6 times', 'once', 'not at all', 'prefer not to answer']),
    numbersOfTimeSpentWithSomeoneLastWeek: z.enum([
      'once a day or more',
      '2 - 6 times',
      'once',
      'not at all',
      'prefer not to answer'
    ]),
    haveSomeoneYouTrust: z.enum(['yes', 'no', 'prefer not to answer']),
    doYouFeelLonely: z.enum(['quite often', 'sometimes', 'almost never', 'prefer not to answer']),
    seeFriendsAndRelativesAsYouWant: z.enum([
      'as often as wants to',
      'somewhat unhappy about how little',
      'prefer not to answer'
    ]),
    someoneTakeCareOfYouWhenNeeded: z.enum(['yes', 'no one willing and able', 'prefer not to answer']),
    someoneTakeCareOfYouAsLongAsYouNeed: z
      .enum([
        'Someone who would take care of you indefinitely (as long as needed)',
        'Someone who would take care of you for a short time (a few weeks to six months)',
        'Someone who would help you now and then (taking you to the doctor, fixing lunch, etc.)',
        'prefer not to answer'
      ])
      .optional()
  }),
  measures: {
    peopleYouKnowCanVisitTheirHome: {
      kind: 'const',
      ref: 'peopleYouKnowCanVisitTheirHome'
    },
    numbersOfCallsLastWeek: {
      kind: 'const',
      ref: 'numbersOfCallsLastWeek'
    },
    numbersOfTimeSpentWithSomeoneLastWeek: {
      kind: 'const',
      ref: 'numbersOfTimeSpentWithSomeoneLastWeek'
    },
    haveSomeoneYouTrust: {
      kind: 'const',
      ref: 'haveSomeoneYouTrust'
    },
    doYouFeelLonely: {
      kind: 'const',
      ref: 'doYouFeelLonely'
    },
    seeFriendsAndRelativesAsYouWant: {
      kind: 'const',
      ref: 'seeFriendsAndRelativesAsYouWant'
    },
    someoneTakeCareOfYouWhenNeeded: {
      kind: 'const',
      ref: 'someoneTakeCareOfYouWhenNeeded'
    },
    someoneTakeCareOfYouAsLongAsYouNeed: {
      kind: 'computed',
      label: {
        en: 'Is there someone who would take care of you as long as you needed, or only for a short time, or only someone who would help you now and then (for example, taking you to the doctor or fixing lunch occasionally, etc.)?',
        fr: "Y a-t-il une personne qui prendrait soin de vous aussi longtemps qu'il le faudrait une courte période, ou qui vous aiderait de temps en temps seulement, par exemple, une personne qui vous conduirait chez le médcin ou vous ferait à déjeuner occasionnellement, etc."
      },
      value: (data) => {
        return data.someoneTakeCareOfYouAsLongAsYouNeed ?? 'N/A';
      }
    }
  }
});
