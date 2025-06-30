import { defineInstrument } from '/runtime/v1/@opendatacapture/runtime-core';
import { sum } from '/runtime/v1/lodash-es@4.x';
import { z } from '/runtime/v1/zod@3.x';

const likertScaleOptions = {
  en: {
    0: 'Never',
    1: 'Rarely',
    2: 'Sometimes',
    3: 'Often',
    4: 'Very Often'
  },
  fr: {
    0: 'Jamais',
    1: 'Rarement',
    2: 'Parfois',
    3: 'Souvent',
    4: 'Très Souvent'
  }
};

const $LikertScaleValidation = z.number().int().min(0).max(4);

export default defineInstrument({
  content: {
    selfReportADHD: {
      items: {
        difficultyConcentrating: {
          label: {
            en: 'How often do you have difficulty concentrating on what people are saying to you even when they are speaking to you directly?',
            fr: "À quelle fréquence avez-vous des difficultés à vous concentrer sur ce que les gens vous disent, même lorsqu'ils vous parlent directement?"
          }
        },
        restlessInappropriately: {
          label: {
            en: 'How often do you leave your seat in meetings or other situations in which you are expected to remain seated?',
            fr: "À quelle fréquence vous levez-vous pendant des réunions ou d'autres situations dans lesquelles vous êtes censé rester assis?"
          }
        },
        difficultyRelaxing: {
          label: {
            en: 'How often do you have difficulty unwinding and relaxing when you have time to yourself?',
            fr: 'À quelle fréquence avez-vous des difficultés à vous détendre et à vous relaxer pendant votre temps libre?'
          }
        },
        sentenceCompletion: {
          label: {
            en: "When you're in a conversation, how often do you find yourself finishing the sentences of the people you are talking to before they can finish them themselves?",
            fr: "À quelle fréquence vous surprenez-vous terminant les phrases des autres dans une discussion avant qu'ils aient pu le faire eux-mêmes?"
          }
        },
        procrastination: {
          label: {
            en: 'How often do you put things off until the last minute?',
            fr: "À quelle fréquence mettez-vous les choses de côté jusqu'à la dernière minute?"
          }
        },
        relyOnOthers: {
          label: {
            en: 'How often do you depend on others to keep your life in order and attend to details?',
            fr: "À quelle fréquence dépendez-vous des autres pour garder votre vie en ordre et s'occuper des détails?"
          }
        }
      },
      kind: 'number-record',
      label: {
        en: 'Check the box that best describes how you have felt and conducted yourself over the past 6 months.',
        fr: 'Cochez la case qui décrit le mieux la manière dont vous vous êtes senti et comporté au cours des six derniers mois.'
      },
      options: likertScaleOptions,
      variant: 'likert'
    }
  },
  details: {
    description: {
      en: [
        'The Adult ADHD Self-Report Scale (ASRS v1.1) and scoring system were developed in conjunction with',
        'the World Health Organization (WHO) and the Workgroup on Adult ADHD to help healthcare',
        'professionals to screen their patients for adult ADHD. Insights gained through this screening may suggest',
        'the need for a more in-depth clinician interview. The questions in the ASRS v1.1 are consistent with',
        'DSM-IV criteria and address the manifestations of ADHD symptoms in adults. The content of the',
        'questionnaire also reflects the importance that DSM-IV places on symptoms, impairments, and history for',
        'a correct diagnosis.'
      ].join(' '),
      fr: [
        "L'échelle d'auto-évaluation du TDAH de l'adulte (ASRS v1.1) et le système de notation ont été élaborés en collaboration",
        "avec l'Organisation mondiale de la santé (OMS) et le groupe de travail sur le TDAH de l'adulte afin d'aider les",
        "professionnels de la santé à dépister le TDAH de l'adulte chez leurs patients. Les informations obtenues grâce à",
        "ce dépistage peuvent suggérer la nécessité d'un entretien plus approfondi avec le clinicien. Les questions",
        "de l'ASRS v1.1 sont conformes aux critères du DSM-IV et portent sur les manifestations des symptômes du TDAH",
        "chez l'adulte. Le contenu du questionnaire reflète également l'importance que le DSM-IV accorde aux",
        'symptômes, aux déficiences et faux antécédents pour un diagnostic correct.'
      ].join(' ')
    },
    estimatedDuration: 1,
    instructions: {
      en: ['This is a self-rated instrument, please answer all questions.'],
      fr: ["Il s'agit d'un instrument d'auto-évaluation, veuillez répondre à toutes les questions."]
    },
    license: 'CC-BY-4.0',
    referenceUrl: 'http://www.hcp.med.harvard.edu/ncs/asrs.php',
    title: {
      en: 'Adult ADHD Self-Report Screening Scale for DSM-5 (ASRS-5) v1.1',
      fr: "Échelle d'auto-évaluation du dépistage du TDAH chez l'adulte pour le DSM-5 (ASRS-5) v1.1"
    }
  },
  internal: {
    edition: 1,
    name: 'ADHD_ASRS_1.1'
  },
  kind: 'FORM',
  language: ['en', 'fr'],
  measures: {
    difficultyConcentrating: {
      kind: 'computed',
      label: { en: 'Result difficulty concentrating', fr: 'Résultat difficulté de concentration' },
      value: (data) => data.selfReportADHD.difficultyConcentrating
    },
    difficultyRelaxing: {
      kind: 'computed',
      label: { en: 'Result difficulty relaxing', fr: 'Résultat difficulté de détente' },
      value: (data) => data.selfReportADHD.difficultyRelaxing
    },
    procrastination: {
      kind: 'computed',
      label: { en: 'Result procrastination', fr: 'Résultat procrastination' },
      value: (data) => data.selfReportADHD.procrastination
    },
    relyOnOthers: {
      kind: 'computed',
      label: { en: 'Result relying on others', fr: 'Résultat dépendant des autres' },
      value: (data) => data.selfReportADHD.relyOnOthers
    },
    restlessInappropriately: {
      kind: 'computed',
      label: { en: 'Result inappropriate restlessness', fr: 'Résultat agitation inappropriée' },
      value: (data) => data.selfReportADHD.restlessInappropriately
    },
    sentenceCompletion: {
      kind: 'computed',
      label: { en: 'Result inappropriate sentence completion', fr: 'Résultat achèvement inapproprié de la phrase' },
      value: (data) => data.selfReportADHD.sentenceCompletion
    },
    totalScore: {
      kind: 'computed',
      label: { en: 'Total ADHD Score', fr: 'Score total de TDAH' },
      value: (data) => {
        return sum(Object.values(data.selfReportADHD));
      }
    }
  },
  tags: {
    en: ['ADHD', 'ADD'],
    fr: ['TDAH', 'TDA']
  },
  validationSchema: z.object({
    selfReportADHD: z.object({
      difficultyConcentrating: $LikertScaleValidation,
      difficultyRelaxing: $LikertScaleValidation,
      procrastination: $LikertScaleValidation,
      relyOnOthers: $LikertScaleValidation,
      restlessInappropriately: $LikertScaleValidation,
      sentenceCompletion: $LikertScaleValidation
    })
  })
});
