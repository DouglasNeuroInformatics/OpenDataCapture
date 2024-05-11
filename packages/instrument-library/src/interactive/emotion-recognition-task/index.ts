const { defineInstrument } = await import('/runtime/v1/opendatacapture@1.0.0/core.js');
const { z } = await import('/runtime/v1/zod@3.23.6/index.js');

import { render } from './render.ts';

import './styles.css';

const $Data = z.object({
  outcomes: z.object({
    emoRecog_accuracy: z.union([z.null(), z.number()]),
    emoRecog_angry_correct: z.union([z.null(), z.number()]),
    emoRecog_angry_meanRTc: z.union([z.null(), z.number()]),
    emoRecog_angry_medianRTc: z.union([z.null(), z.number()]),
    emoRecog_angry_responses: z.union([z.null(), z.number()]),
    emoRecog_angry_sdRTc: z.union([z.null(), z.number()]),
    emoRecog_fearful_correct: z.union([z.null(), z.number()]),
    emoRecog_fearful_meanRTc: z.union([z.null(), z.number()]),
    emoRecog_fearful_medianRTc: z.union([z.null(), z.number()]),
    emoRecog_fearful_responses: z.union([z.null(), z.number()]),
    emoRecog_fearful_sdRTc: z.union([z.null(), z.number()]),
    emoRecog_happy_correct: z.union([z.null(), z.number()]),
    emoRecog_happy_meanRTc: z.union([z.null(), z.number()]),
    emoRecog_happy_medianRTc: z.union([z.null(), z.number()]),
    emoRecog_happy_responses: z.union([z.null(), z.number()]),
    emoRecog_happy_sdRTc: z.union([z.null(), z.number()]),
    emoRecog_meanRTc: z.union([z.null(), z.number()]),
    emoRecog_medianRTc: z.union([z.null(), z.number()]),
    emoRecog_sad_correct: z.union([z.null(), z.number()]),
    emoRecog_sad_meanRTc: z.union([z.null(), z.number()]),
    emoRecog_sad_medianRTc: z.union([z.null(), z.number()]),
    emoRecog_sad_responses: z.union([z.null(), z.number()]),
    emoRecog_sad_sdRTc: z.union([z.null(), z.number()]),
    emoRecog_sdRTc: z.union([z.null(), z.number()])
  }),
  results: z.array(
    z.object({
      accuracy: z.union([z.null(), z.number()]),
      emotion: z.string(),
      response: z.union([z.number(), z.string()]),
      rt: z.number(),
      stimulus: z.string()
    })
  )
});

export type Data = import('/runtime/v1/zod@3.23.6/index.js').z.infer<typeof $Data>;

export default defineInstrument({
  content: {
    render
  },
  details: {
    authors: ['The Many Brains Project', 'McLean Hospital', 'Paolo Martini', 'Douglas Neuroinformatics Platform'],
    description: [
      'This is an emotion recognition task adapted from the the Many Brains Open Science Repository.',
      'It involves judging facial expressions and emotions.'
    ].join(' '),
    estimatedDuration: 1,
    instructions: ['Please follow the instructions on your screen.'],
    license: 'CC-BY-SA-4.0',
    title: 'Emotion Recognition Task'
  },
  kind: 'INTERACTIVE',
  language: 'en',
  measures: {},
  name: 'CPP-EmotionRecognitionTask',
  tags: ['CPP'],
  validationSchema: $Data,
  version: 1.0
});
