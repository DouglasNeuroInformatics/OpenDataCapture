import { defineInstrument } from '/runtime/v1/@opendatacapture/runtime-core';
import { createRoot } from '/runtime/v1/react-dom@18.x/client';
import { z } from '/runtime/v1/zod@3.23.x';

import './styles.css';

export default defineInstrument({
  content: {
    render(done) {
      const rootElement = document.createElement('div');
      document.body.appendChild(rootElement);
      const root = createRoot(rootElement);
      root.render(
        <div>
          <h1>Interactive Task</h1>
          <button onClick={() => done({})}>Done</button>
        </div>
      );
    }
  },
  details: {
    description: 'This is an interactive instrument',
    estimatedDuration: 1,
    instructions: ['Please complete the task'],
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