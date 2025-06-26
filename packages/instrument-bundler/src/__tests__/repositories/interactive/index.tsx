import { defineInstrument } from '/runtime/v1/@opendatacapture/runtime-core';
import { createRoot } from '/runtime/v1/react-dom@19.x/client';
import { z } from '/runtime/v1/zod@3.x';

const { sum } = await import('/runtime/v1/lodash-es@4.x');

import './styles.css';
import '/runtime/v1/normalize.css@8.x/normalize.css';

export default defineInstrument({
  clientDetails: {
    estimatedDuration: 1,
    instructions: ['Please complete the task']
  },
  content: {
    render(done) {
      const rootElement = document.createElement('div');
      document.body.appendChild(rootElement);
      const root = createRoot(rootElement);
      root.render(
        <div>
          <h1>Interactive Task</h1>
          <button onClick={() => done({ value: sum([1, 2, 3]) })}>Done</button>
        </div>
      );
    }
  },
  details: {
    description: 'This is an interactive instrument',
    license: 'Apache-2.0',
    title: 'Interactive Instrument Stub'
  },
  internal: {
    edition: 1,
    name: 'INTERACTIVE_INSTRUMENT_STUB'
  },
  kind: 'INTERACTIVE',
  language: 'en',
  measures: {},
  tags: ['Interactive'],
  validationSchema: z.any()
});
