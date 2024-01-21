/* eslint-disable perfectionist/sort-objects */

const { InstrumentFactory } = await import('/runtime/v0.0.1/core.js');
const { z } = await import('/runtime/v0.0.1/zod.js');

const instrumentFactory = new InstrumentFactory({
  kind: 'FORM',
  language: 'en',
  validationSchema: z.object({
    somaticConcern: z.number().int().min(0).max(7),
    anxiety: z.number().int().min(0).max(7),
    emotionalWithdrawal: z.number().int().min(0).max(7),
    conceptualDisorganization: z.number().int().min(0).max(7),
    guiltFeelings: z.number().int().min(0).max(7),
    tension: z.number().int().min(0).max(7),
    mannerismsAndPosturing: z.number().int().min(0).max(7),
    grandiosity: z.number().int().min(0).max(7),
    depressiveMood: z.number().int().min(0).max(7),
    hostility: z.number().int().min(0).max(7),
    suspiciousness: z.number().int().min(0).max(7),
    hallucinatoryBehavior: z.number().int().min(0).max(7),
    motorRetardation: z.number().int().min(0).max(7),
    uncooperativeness: z.number().int().min(0).max(7),
    unusualThoughtContent: z.number().int().min(0).max(7),
    bluntedAffect: z.number().int().min(0).max(7),
    excitement: z.number().int().min(0).max(7),
    disorientation: z.number().int().min(0).max(7)
  })
});

export default instrumentFactory.defineInstrument({
  name: 'BriefPsychiatricRatingScale',
  tags: ['Schizophrenia', 'Psychosis'],
  version: 1,
  content: {
    anxiety: {
      description:
        "Worry, fear, or over-concern for present or future. Rate solely on the basis of verbal report of patient's own subjective experiences. Do not infer anxiety from physical signs or from neurotic defense mechanisms.",
      kind: 'numeric',
      label: 'Anxiety',
      max: 7,
      min: 0,
      variant: 'slider'
    },
    bluntedAffect: {
      description: 'Reduced emotional tone, apparent lack of normal feeling or involvement.',
      kind: 'numeric',
      label: 'Blunted Affect',
      max: 7,
      min: 0,
      variant: 'slider'
    },
    conceptualDisorganization: {
      description:
        "Degree to which the thought processes are confused, disconnected, or disorganized. Rate on the basis of integration of the verbal products of the patient; do not rate on the basis of patient's subjective impression of his own level of functioning.",
      kind: 'numeric',
      label: 'Conceptual Disorganization',
      max: 7,
      min: 0,
      variant: 'slider'
    },
    depressiveMood: {
      description:
        'Despondency in mood, sadness. Rate only degree of despondency; do not rate on the basis of inferences concerning depression based upon general retardation and somatic complaints.',
      kind: 'numeric',
      label: 'Depressive Mood',
      max: 7,
      min: 0,
      variant: 'slider'
    },
    disorientation: {
      description: 'Confusion or lack of proper association for person, place or time.',
      kind: 'numeric',
      label: 'Disorientation',
      max: 7,
      min: 0,
      variant: 'slider'
    },
    emotionalWithdrawal: {
      description:
        'Deficiency in relating to the interviewer and to the interviewer situation. Rate only the degree to which the patient gives the impression of failing to be in emotional contact with other people in the interview situation.',
      kind: 'numeric',
      label: 'Emotional Withdrawal',
      max: 7,
      min: 0,
      variant: 'slider'
    },
    excitement: {
      description: 'Heightened emotional tone, agitation, increased reactivity.',
      kind: 'numeric',
      label: 'Excitement',
      max: 7,
      min: 0,
      variant: 'slider'
    },
    grandiosity: {
      description:
        'Exaggerated self-opinion, conviction of unusual ability or powers. Rate only on the basis of patient’s statements about himself or self-in-relation-to-others, not on the basis of his demeanor in the interview situation.',
      kind: 'numeric',
      label: 'Grandiosity',
      max: 7,
      min: 0,
      variant: 'slider'
    },
    guiltFeelings: {
      description:
        "Over-concern or remorse for past behavior. Rate on the basis of the patient's subjective experiences of guilt as evidenced by verbal report with appropriate affect; do not infer guilt feelings from depression, anxiety or neurotic defenses.",
      kind: 'numeric',
      label: 'Guilt Feelings',
      max: 7,
      min: 0,
      variant: 'slider'
    },
    hallucinatoryBehavior: {
      description:
        'Perceptions without normal external stimulus correspondence. Rate only those experiences which are reported to have occurred within the last week and which are described as distinctly different from the thought and imagery processes of normal people.',
      kind: 'numeric',
      label: 'Hallucinatory Behavior',
      max: 7,
      min: 0,
      variant: 'slider'
    },
    hostility: {
      description:
        'Animosity, contempt, belligerence, disdain for other people outside the interview situation. Rate solely on the basis of the verbal report of feelings and actions of the patient toward others; do not infer hostility from neurotic defenses, anxiety, nor somatic complaints. (Rate attitude toward interviewer under “uncooperativeness”).',
      kind: 'numeric',
      label: 'Hostility',
      max: 7,
      min: 0,
      variant: 'slider'
    },
    mannerismsAndPosturing: {
      description:
        'Unusual and unnatural motor behavior, the type of motor behavior which causes certain mental patients to stand out in a crowd of normal people. Rate only abnormality of movements; do not rate simple heightened motor activity here.',
      kind: 'numeric',
      label: 'Mannerisms And Posturing',
      max: 7,
      min: 0,
      variant: 'slider'
    },
    motorRetardation: {
      description:
        "Reduction in energy level evidenced in slowed movements. Rate on the basis of observed behavior of the patient only; do not rate on the basis of patient's subjective impression of own energy level.",
      kind: 'numeric',
      label: 'Motor Retardation',
      max: 7,
      min: 0,
      variant: 'slider'
    },
    somaticConcern: {
      description:
        'Degree of concern over present bodily health. Rate the degree to which physical health is perceived as a problem by the patient, whether complaints have a realistic basis or not.',
      kind: 'numeric',
      label: 'Somatic Concern',
      max: 7,
      min: 0,
      variant: 'slider'
    },
    suspiciousness: {
      description:
        'Brief (delusional or otherwise) that others have now, or have had in the past, malicious or discriminatory intent toward the patient. On the basis of verbal report, rate only those suspicions which are currently held whether they concern past or present circumstances.',
      kind: 'numeric',
      label: 'Suspiciousness',
      max: 7,
      min: 0,
      variant: 'slider'
    },
    tension: {
      description:
        'Physical and motor manifestations of tension “nervousness”, and heightened activation level. Tension should be rated solely on the basis of physical signs and motor behavior and not on the basis of subjective experiences of tension reported by the patient.',
      kind: 'numeric',
      label: 'Tension',
      max: 7,
      min: 0,
      variant: 'slider'
    },
    uncooperativeness: {
      description:
        'Evidence of resistance, unfriendliness, resentment, and lack of readiness to cooperate with the interviewer. Rate only on the basis of the patient’s attitude and responses to the interviewer and the interview situation; do not rate on basis of reported resentment or uncooperativeness outside the interview situation.',
      kind: 'numeric',
      label: 'Uncooperativeness',
      max: 7,
      min: 0,
      variant: 'slider'
    },
    unusualThoughtContent: {
      description:
        'Unusual, odd, strange or bizarre thought content. Rate here the degree of unusualness, not the degree of disorganization of thought processes.',
      kind: 'numeric',
      label: 'Unusual Thought Content',
      max: 7,
      min: 0,
      variant: 'slider'
    }
  },
  details: {
    description: `
      The Brief Psychiatric Rating Scale is a rating scale which a clinician or researcher may use to
      measure psychiatric symptoms such as depression, anxiety, hallucinations and unusual behavior.
      The scale is one of the oldest, most widely used scales to measure psychotic symptoms and was
      first published in 1962.`,
    estimatedDuration: 30,
    instructions: [
      "Please enter the score for the term which best describes the patient's condition.",
      '0 = not assessed, 1 = not present, 2 = very mild, 3 = mild, 4 = moderate, 5 = moderately severe, 6 = severe, 7 = extremely severe.'
    ],
    title: 'Brief Psychiatric Rating Scale'
  },
  measures: {
    totalScore: {
      label: 'Total Score',
      value: (data) => {
        let sum = 0;
        data;
        Object.values(data).forEach((value) => {
          sum += value;
        });
        return sum;
      }
    }
  }
});
