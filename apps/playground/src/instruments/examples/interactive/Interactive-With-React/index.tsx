import { App } from './App.tsx';

const { defineInstrument } = await import('/runtime/v1/core.js');
const { default: React } = await import('/runtime/v1/react.js');
const { createRoot } = await import('/runtime/v1/react-dom/client.js');
const { z } = await import('/runtime/v1/zod.js');

import './index.css';

export default defineInstrument({
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
    estimatedDuration: 1,
    instructions: ['Please submit whatever count you want!'],
    license: 'AGPL-3.0',
    title: 'React Click Task'
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
  name: 'InteractiveInstrument',
  tags: ['Interactive'],
  validationSchema: z.object({
    count: z.number().int()
  }),
  version: 1.0
});
