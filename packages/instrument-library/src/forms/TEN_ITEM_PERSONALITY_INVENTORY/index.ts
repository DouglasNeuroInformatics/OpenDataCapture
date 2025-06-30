import { defineInstrument } from '/runtime/v1/@opendatacapture/runtime-core';
import { z } from '/runtime/v1/zod@3.x';

const $IntScale = z.number().int().min(1).max(7);
const $ContinuousScale = z.number().min(1).max(7);

const scaleOptions = {
  en: {
    1: 'Disagree strongly',
    2: 'Disagree moderately',
    3: 'Disagree a little',
    4: 'Neither agree or disagree',
    5: 'Agree a little',
    6: 'Agree moderately',
    7: 'Agree strongly'
  },
  fr: {
    1: 'Fortement en désaccord',
    2: 'En désaccord',
    3: 'Légèrement en désaccord',
    4: 'Ni en désaccord ni en accord',
    5: 'Légèrement en accord',
    6: 'En accord',
    7: 'Fortement en accord'
  }
};

/** compute reverse score, i.e. 1 become 7, 2 becomes 6, etc. */
function reverseScore(score: number): number {
  return 8 - score;
}

/** compute final score by doing ((reverseScore(a) + b) / 2)  */
const computeScore = (a: number, b: number) => (((reverseScore(a) + b) / 2) * 100) / 100;

export default defineInstrument({
  kind: 'FORM',
  language: ['en', 'fr'],
  internal: {
    name: 'TEN_ITEM_PERSONALITY_INVENTORY',
    edition: 1
  },
  tags: {
    en: [
      'personality',
      'traits',
      'extraversion',
      'agreeableness',
      'conscientiousness',
      'emotional',
      'stability',
      'openness'
    ],
    fr: ['personnalité', 'traits', 'extraversion', 'amabilité', 'conscience', 'émotionnel', 'stabilité', 'ouverture']
  },
  details: {
    description: {
      en: 'The Ten-Item Personality Inventory (TIPI) is a brief instrument designed to assess the five-factor model (FFM) personality dimensions. It was specifically developed to provide a brief assessment option in situations where using more comprehensive FFM instruments would be unfeasible.',
      fr: "L'inventaire de personnalité en dix éléments (TIPI) est un bref instrument conçu pour évaluer les dimensions de la personnalité du modèle à cinq facteurs (FFM). Il a été spécifiquement développé pour fournir une brève option d’évaluation dans les situations où l’utilisation d’instruments FFM plus complets serait impossible."
    },
    estimatedDuration: 5,
    instructions: {
      en: ['Please respond to every question'],
      fr: ['Veuillez répondre à toutes les questions']
    },
    license: 'FREE-NOS',
    title: {
      en: 'Ten-Item Personality Inventory (TIPI)',
      fr: 'Ten-Item Personality Inventory (TIPI)'
    }
  },
  content: [
    {
      description: {
        en: 'Here are a number of personality traits that may or may not apply to you. Please select a number next to each statement to indicate the extent to which you agree or disagree with that statement. You should rate the extent to which the pair of traits applies to you, even if one characteristic applies more strongly than the other.',
        fr: "Voici une liste de traits de caractère qui peuvent ou non vous correspondre. Veuillez indiquer dans quelle mesure vous pensez qu'ils vous correspondent. Veuillez évaluer la paire de caractéristique même si une caractéristique s'applique plus que l'autre."
      },
      fields: {
        extrovertedEnthusiastic: {
          kind: 'number',
          label: {
            en: '1. Extroverted, enthusiastic.',
            fr: '1. Extraverti(e), enthousiaste.'
          },
          options: scaleOptions,
          variant: 'select'
        },
        criticalQuarrelsome: {
          kind: 'number',
          label: {
            en: '2. Critical, quarrelsome.',
            fr: '2. Critique, agressif(ve).'
          },
          options: scaleOptions,
          variant: 'select'
        },
        dependableSelfDisciplined: {
          kind: 'number',
          label: {
            en: '3. Dependable, self-disciplined.',
            fr: '3. Digne de confiance, autodiscipliné(e).`'
          },
          options: scaleOptions,
          variant: 'select'
        },
        anxiousEasilyUpset: {
          kind: 'number',
          label: {
            en: '4. Anxious, easily upset.',
            fr: '4. Anxieux(euse), facilement troublé(e).'
          },
          options: scaleOptions,
          variant: 'select'
        },
        newExperiencesComplex: {
          kind: 'number',
          label: {
            en: '5. Open to new experiences, complex.',
            fr: "5. Ouvert(e) à de nouvelles expériences, d'une personnalité complexe."
          },
          options: scaleOptions,
          variant: 'select'
        },
        reservedQuiet: {
          kind: 'number',
          label: {
            en: '6. Reserved, quiet.',
            fr: '6. Réservé(e), tranquille.'
          },
          options: scaleOptions,
          variant: 'select'
        },
        sympatheticWarm: {
          kind: 'number',
          label: {
            en: '7. Sympathetic, warm.',
            fr: '7. Sympathique, chaleureux(euse).'
          },
          options: scaleOptions,
          variant: 'select'
        },
        disorganizedCareless: {
          kind: 'number',
          label: {
            en: '8. Disorganized, careless.',
            fr: '8. Désorganisé(e), négligent(e).'
          },
          options: scaleOptions,
          variant: 'select'
        },
        calmEmotionallyStable: {
          kind: 'number',
          label: {
            en: '9. Calm, emotionally stable.',
            fr: '9. Calme, émotionnellement stable.'
          },
          options: scaleOptions,
          variant: 'select'
        },
        conventionalUncreative: {
          kind: 'number',
          label: {
            en: '10. Conventional, uncreative.',
            fr: '10. Conventionnel(le), peu créatif(ve).'
          },
          options: scaleOptions,
          variant: 'select'
        }
      }
    }
  ],
  measures: {
    extraversion: {
      kind: 'computed',
      label: {
        en: 'Extraversion (higher score = more extroverted, range 1-7)',
        fr: 'Extraversion (higher score = more extroverted, range 1-7)'
      },
      value: (data) => {
        // calculate the score = (reverse(q6) + q1) / 2
        const score1 = data.extrovertedEnthusiastic;
        const score6 = data.reservedQuiet;
        return computeScore(score6, score1);
      }
    },
    agreeableness: {
      kind: 'computed',
      label: {
        en: 'Agreeableness (higher score = more agreeable, range 1-7)',
        fr: 'Agreeableness (higher score = more agreeable, range 1-7)'
      },
      value: (data) => {
        // calculate the score = (reverse(q2) + q7) / 2
        const score2 = data.criticalQuarrelsome;
        const score7 = data.sympatheticWarm;
        return computeScore(score2, score7);
      }
    },
    conscientiousness: {
      kind: 'computed',
      label: {
        en: 'Conscientiousness (higher score = more conscientious, range 1-7)',
        fr: 'Conscientiousness (higher score = more conscientious, range 1-7)'
      },
      value: (data) => {
        // calculate the score = (reverse(q8) + q3) / 2
        const score3 = data.dependableSelfDisciplined;
        const score8 = data.disorganizedCareless;
        return computeScore(score8, score3);
      }
    },
    emotionalStability: {
      kind: 'computed',
      label: {
        en: 'Emotional Stability (higher score = more stable, range 1-7)',
        fr: 'Emotional Stability (higher score = more stable, range 1-7)'
      },
      value: (data) => {
        // calculate the score = (reverse(q4) + q9) / 2
        const score4 = data.anxiousEasilyUpset;
        const score9 = data.calmEmotionallyStable;
        return computeScore(score4, score9);
      }
    },
    openessToExperience: {
      kind: 'computed',
      label: {
        en: 'Openness to Experience (higher score = more open, range 1-7)',
        fr: 'Openness to Experience (higher score = more open, range 1-7)'
      },
      value: (data) => {
        // calculate the score = (reverse(q10) + q5) / 2
        const score5 = data.newExperiencesComplex;
        const score10 = data.conventionalUncreative;
        return computeScore(score10, score5);
      }
    }
  },
  validationSchema: z.object({
    //answers
    extrovertedEnthusiastic: $IntScale,
    criticalQuarrelsome: $IntScale,
    dependableSelfDisciplined: $IntScale,
    anxiousEasilyUpset: $IntScale,
    newExperiencesComplex: $IntScale,
    reservedQuiet: $IntScale,
    sympatheticWarm: $IntScale,
    disorganizedCareless: $IntScale,
    calmEmotionallyStable: $IntScale,
    conventionalUncreative: $IntScale,
    //measures
    extraversion: $ContinuousScale.optional(),
    agreeableness: $ContinuousScale.optional(),
    conscientiousness: $ContinuousScale.optional(),
    emotionalStability: $ContinuousScale.optional(),
    opennessToExperience: $ContinuousScale.optional()
  })
});
