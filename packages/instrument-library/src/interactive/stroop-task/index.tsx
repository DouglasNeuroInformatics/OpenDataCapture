import { defineInstrument } from '/runtime/v1/@opendatacapture/runtime-core';
import { createRoot } from '/runtime/v1/react-dom@18.x/client.js';
import { z } from '/runtime/v1/zod@3.23.x';

import { StroopTask } from './StroopTask.tsx';

import './styles.css';

export default defineInstrument({
  clientDetails: {
    estimatedDuration: 1,
    instructions: ['Please follow the instructions on the screen.']
  },
  content: {
    render(done) {
      const rootElement = document.createElement('div');
      document.body.appendChild(rootElement);
      const root = createRoot(rootElement);
      root.render(<StroopTask done={(data) => done(data)} />);
    }
  },
  details: {
    description: 'The Stroop Task is a psychological test designed to measure cognitive flexibility and attention.',
    license: 'Apache-2.0',
    title: 'Stroop Task'
  },
  internal: {
    edition: 1,
    name: 'INTERACTIVE_INSTRUMENT'
  },
  kind: 'INTERACTIVE',
  language: 'en',
  measures: {
    score: {
      kind: 'const',
      label: 'Score',
      ref: 'score'
    }
  },
  tags: ['Interactive'],
  validationSchema: z.object({
    score: z.number().int()
  })
});
