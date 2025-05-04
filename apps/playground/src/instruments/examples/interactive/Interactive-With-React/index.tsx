import { defineInstrument } from '/runtime/v1/@opendatacapture/runtime-core';
import { createRoot } from '/runtime/v1/react-dom@19.x/client.js';
import { z } from '/runtime/v1/zod@3.23.x';

import { App } from './App.tsx';

import './index.css';

export default defineInstrument({
  clientDetails: {
    estimatedDuration: 1,
    instructions: ['Please submit whatever count you want!']
  },
  content: {
    render(done) {
      const rootElement = document.createElement('div');
      document.body.appendChild(rootElement);
      const root = createRoot(rootElement);
      root.render(<App done={(data) => done(data)} />);
    }
  },
  details: {
    description: 'This task is completely useless. It is a proof of concept for an interactive instrument.',
    license: 'Apache-2.0',
    title: 'React Click Task'
  },
  internal: {
    edition: 1,
    name: 'INTERACTIVE_INSTRUMENT'
  },
  kind: 'INTERACTIVE',
  language: 'en',
  measures: {
    count: {
      kind: 'const',
      label: 'Count',
      ref: 'count'
    }
  },

  tags: ['Interactive'],
  validationSchema: z.object({
    count: z.number().int()
  })
});
