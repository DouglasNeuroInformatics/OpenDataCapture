const { defineInstrument } = await import('/runtime/v1/opendatacapture@1.0.0/core.js');
const { z } = await import('/runtime/v1/zod@3.23.6/index.js');

import { render } from './render.ts';

import './styles.css';

export default defineInstrument({
  content: {
    render
  },
  details: {
    authors: ['The Many Brains Project', 'Paolo Martini', 'Douglas Neuroinformatics Platform'],
    description: [
      'This is a Verbal Paired Associates Task adapted from the the Many Brains Open Science Repository.'
    ].join(' '),
    estimatedDuration: 1,
    instructions: ['Please follow the instructions on your screen.'],
    license: 'CC-BY-SA-4.0',
    title: 'Verbal Paired Associates Task'
  },
  internal: {
    edition: 1,
    name: 'CPP_VERBAL_PAIRED_ASSOCIATES_STUDY'
  },
  kind: 'INTERACTIVE',
  language: 'en',
  measures: {},
  tags: ['CPP', 'Cognitive'],
  validationSchema: z.object({ success: z.boolean() })
});
