import { defineInstrument } from '/runtime/v1/@opendatacapture/runtime-core';
import { z } from '/runtime/v1/zod@3.x';

const $FieldOptionsValidation = z.number().int().gte(0).lte(3);
const fieldOptionsLikertScale = {
  en: {
    0: 'Not at all',
    1: 'Slightly',
    2: 'Some',
    3: 'A lot'
  },
  fr: {
    0: 'Pas du tout',
    1: 'Un peut',
    2: 'Assez',
    3: 'Beaucoup'
  }
};

export default defineInstrument({
  kind: 'FORM',
  language: ['en', 'fr'],
  validationSchema: z.object({
    interestedInLearningNewThings: $FieldOptionsValidation,
    anythingInterestsYou: $FieldOptionsValidation,
    concernedAboutOwnCondition: $FieldOptionsValidation,
    putMuchEffortIntoThings: $FieldOptionsValidation,
    alwaysLookForSomethingToDo: $FieldOptionsValidation,
    havePlanAndGoalsForFuture: $FieldOptionsValidation,
    haveMotivation: $FieldOptionsValidation,
    haveEnergyForDailyActivities: $FieldOptionsValidation,
    needToTellYouWhatToDoEveryday: $FieldOptionsValidation,
    indifferentToThings: $FieldOptionsValidation,
    unconcernedWithManyThings: $FieldOptionsValidation,
    needPushToGetStarted: $FieldOptionsValidation,
    notHappyOrSadJustNeutral: $FieldOptionsValidation,
    areYouApathetic: $FieldOptionsValidation
  }),
  details: {
    description: {
      en: 'For each question, choose the answer that best describes your thoughts, feelings, and behaviors in the last 4 weeks.',
      fr: 'Pour chaque question, choisissez la réponse qui décrit le mieux vos pensées, sentiments et comportements au cours des 4 dernières semaines.'
    },
    license: 'PUBLIC-DOMAIN',
    title: {
      en: 'Starkstein Apathy Scale',
      fr: "Échelle d'apathie de Starkstein"
    },
    referenceUrl: 'https://www.ncbi.nlm.nih.gov/pmc/articles/PMC8467636/',
    estimatedDuration: 5,
    instructions: {
      en: [
        'For each question, choose the answer that best describes your thoughts, feelings, and behaviors in the last 4 weeks.'
      ],
      fr: [
        'Pour chaque question, choisissez la réponse qui décrit le mieux vos pensées, sentiments et comportements au cours des 4 dernières semaines.'
      ]
    }
  },
  content: {
    interestedInLearningNewThings: {
      kind: 'number',
      variant: 'radio',
      label: {
        en: 'Are you interested in learning new things?',
        fr: 'Êtes-vous intéressé à apprendre de nouvelles choses?'
      },
      options: fieldOptionsLikertScale
    },
    anythingInterestsYou: {
      kind: 'number',
      variant: 'radio',
      label: {
        en: 'Does anything interest you?',
        fr: "Est-ce qu'il y a des choses qui vous intéressent?"
      },
      options: fieldOptionsLikertScale
    },
    concernedAboutOwnCondition: {
      kind: 'number',
      variant: 'radio',
      label: {
        en: 'Are you concerned about your condition?',
        fr: 'Êtes-vous préoccupé par votre état de santé ?'
      },
      options: fieldOptionsLikertScale
    },
    putMuchEffortIntoThings: {
      kind: 'number',
      variant: 'radio',
      label: {
        en: 'Do you put much effort into things?',
        fr: "Est-ce que vous mettez beaucoup d'effort dans ce que vous faites?"
      },
      options: fieldOptionsLikertScale
    },
    alwaysLookForSomethingToDo: {
      kind: 'number',
      variant: 'radio',
      label: {
        en: 'Are you always looking for something to do?',
        fr: "Vous êtes toujours à la recherche d'une activité ?"
      },
      options: fieldOptionsLikertScale
    },
    havePlanAndGoalsForFuture: {
      kind: 'number',
      variant: 'radio',
      label: {
        en: 'Do you have plans and goals for the future?',
        fr: "Avez-vous des projets et des objectifs pour l'avenir ?"
      },
      options: fieldOptionsLikertScale
    },
    haveMotivation: {
      kind: 'number',
      variant: 'radio',
      label: {
        en: 'Do you have motivation?',
        fr: 'Êtes-vous motivé (e)?'
      },
      options: fieldOptionsLikertScale
    },
    haveEnergyForDailyActivities: {
      kind: 'number',
      variant: 'radio',
      label: {
        en: 'Do you have the energy for daily activities?',
        fr: "Avez-vous de l'énergie pour les activités quotidiennes? "
      },
      options: fieldOptionsLikertScale
    },
    needToTellYouWhatToDoEveryday: {
      kind: 'number',
      variant: 'radio',
      label: {
        en: 'Does someone have to tell you what to do each day?',
        fr: "Est-ce que quelqu'un doit vous dire quoi faire à chaque jour? "
      },
      options: fieldOptionsLikertScale
    },
    indifferentToThings: {
      kind: 'number',
      variant: 'radio',
      label: {
        en: 'Are you indifferent to things?',
        fr: 'Est-ce que les choses vous laissent indifférent(e)s? '
      },
      options: fieldOptionsLikertScale
    },
    unconcernedWithManyThings: {
      kind: 'number',
      variant: 'radio',
      label: {
        en: 'Are you unconcerned with many things?',
        fr: 'Êtes-vous indifférent à beaucoup de choses ?'
      },
      options: fieldOptionsLikertScale
    },
    needPushToGetStarted: {
      kind: 'number',
      variant: 'radio',
      label: {
        en: 'Do you need a push to get started on things?',
        fr: "Avez-vous besoin d'être poussé(e) pour commencer des choses? "
      },
      options: fieldOptionsLikertScale
    },
    notHappyOrSadJustNeutral: {
      kind: 'number',
      variant: 'radio',
      label: {
        en: 'Are you neither happy nor sad, just in between?',
        fr: "Vous n'êtes ni heureux ni triste, mais entre les deux ?"
      },
      options: fieldOptionsLikertScale
    },
    areYouApathetic: {
      kind: 'number',
      variant: 'radio',
      label: {
        en: 'Would you consider yourself apathetic?',
        fr: 'Est-ce que vous vous considérez comme étant apathique?'
      },
      options: fieldOptionsLikertScale
    }
  },
  internal: {
    name: 'STARKSTEIN_APATHY_SCALE',
    edition: 1
  },
  measures: {
    interestedInLearningNewThings: {
      kind: 'const',
      ref: 'interestedInLearningNewThings'
    },
    anythingInterestsYou: {
      kind: 'const',
      ref: 'anythingInterestsYou'
    },
    concernedAboutOwnCondition: {
      kind: 'const',
      ref: 'concernedAboutOwnCondition'
    },
    putMuchEffortIntoThings: {
      kind: 'const',
      ref: 'putMuchEffortIntoThings'
    },
    alwaysLookForSomethingToDo: {
      kind: 'const',
      ref: 'alwaysLookForSomethingToDo'
    },
    havePlanAndGoalsForFuture: {
      kind: 'const',
      ref: 'havePlanAndGoalsForFuture'
    },
    haveMotivation: {
      kind: 'const',
      ref: 'haveMotivation'
    },
    haveEnergyForDailyActivities: {
      kind: 'const',
      ref: 'haveEnergyForDailyActivities'
    },
    needToTellYouWhatToDoEveryday: {
      kind: 'const',
      ref: 'needToTellYouWhatToDoEveryday'
    },
    indifferentToThings: {
      kind: 'const',
      ref: 'indifferentToThings'
    },
    unconcernedWithManyThings: {
      kind: 'const',
      ref: 'unconcernedWithManyThings'
    },
    needPushToGetStarted: {
      kind: 'const',
      ref: 'needPushToGetStarted'
    },
    notHappyOrSadJustNeutral: {
      kind: 'const',
      ref: 'notHappyOrSadJustNeutral'
    },
    areYouApathetic: {
      kind: 'const',
      ref: 'areYouApathetic'
    }
  },
  tags: {
    en: ['Apathy'],
    fr: ['Apathie']
  }
});
