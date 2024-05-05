const { defineInstrument } = await import('/runtime/v1/opendatacapture@1.0.0/core.js');
const { z } = await import('/runtime/v1/zod@3.23.6/index.js');

import { render } from './render.ts';

import './styles.css';

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
  validationSchema: z.any(),
  version: 1.0
});
