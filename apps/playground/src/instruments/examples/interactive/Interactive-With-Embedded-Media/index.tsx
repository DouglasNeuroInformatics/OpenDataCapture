import { defineInstrument } from '/runtime/v1/@opendatacapture/runtime-core';
import { createRoot } from '/runtime/v1/react-dom@19.x/client.js';

import { $TaskData, Task } from './Task.tsx';

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
      root.render(<Task done={done} />);
    }
  },
  details: {
    authors: ['Joshua Unrau'],
    description: 'This test assesses whether a person can identify various animals',
    license: 'Apache-2.0',
    title: 'Interactive With Embedded Media'
  },
  internal: {
    edition: 1,
    name: 'CAT_VIDEO_TASK'
  },
  kind: 'INTERACTIVE',
  language: 'en',
  measures: {
    score: {
      kind: 'computed',
      label: 'Percentage Correct',
      value: (data) => {
        return Object.values(data).filter(Boolean).length / Object.keys(data).length;
      },
      visibility: 'visible'
    },
    seconds: {
      kind: 'const',
      label: 'Seconds to Complete',
      ref: 'seconds',
      visibility: 'visible'
    }
  },
  tags: ['Interactive', 'React'],
  validationSchema: $TaskData
});
