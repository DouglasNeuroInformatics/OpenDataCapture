import { render } from './render.js';

const { defineInstrument } = await import('/runtime/v1/opendatacapture@1.0.0/core.js');
const { z } = await import('/runtime/v1/zod@3.23.6/index.js');

import './styles.css';

export default defineInstrument({
  content: {
    render
  },
  details: {
    authors: [
      'The Many Brains Project',
      'McLean Hospital',
      'Paolo Martini',
      'Jeremy Wilmer',
      'Douglas Neuroinformatics Platform'
    ],
    description: 'This is a matrix reasoning task adapted from the the Many Brains Open Science Repository.',
    estimatedDuration: 1,
    instructions: ['Please follow the instructions on your screen.'],
    license: 'CC-BY-SA-4.0',
    title: 'Pattern Completion Test'
  },
  edition: 1,
  kind: 'INTERACTIVE',
  language: 'en',
  measures: {
    score: {
      kind: 'const',
      ref: 'score'
    }
  },
  name: 'CPP_MATRIX_REASONING_TASK',
  tags: ['CPP'],
  validationSchema: z.object({
    results: z.array(
      z.object({
        correct: z.any(),
        correctResponse: z.any(),
        response: z.any(),
        rt: z.any(),
        type: z.any()
      })
    ),
    score: z.number()
  })
});
