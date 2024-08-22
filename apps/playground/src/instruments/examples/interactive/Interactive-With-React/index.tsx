import { App } from './App.tsx';

const { defineInstrument } = await import('/runtime/v1/@opendatacapture/runtime-core/index.js');
const { createRoot } = await import('/runtime/v1/react-dom@18.x/client.js');
const { z } = await import('/runtime/v1/zod@3.23.x/index.js');

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
