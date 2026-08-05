import { defineInstrument } from '/runtime/v1/@opendatacapture/runtime-core';
import { createRoot } from '/runtime/v1/react-dom@18.x/client';
import { useState } from '/runtime/v1/react@18.x';
import { z } from '/runtime/v1/zod@3.x';

const Task = ({ done }: { done: (data: { value: number }) => void }) => {
  const [value, setValue] = useState(0);
  return (
    <div>
      <button onClick={() => setValue(value + 1)}>Increment</button>
      <button onClick={() => done({ value })}>Done</button>
    </div>
  );
};

export default defineInstrument({
  clientDetails: {
    estimatedDuration: 1,
    instructions: ['Please complete the task']
  },
  content: {
    render(done) {
      const rootElement = document.createElement('div');
      document.body.appendChild(rootElement);
      createRoot(rootElement).render(<Task done={done} />);
    }
  },
  details: {
    description: 'This is an interactive instrument rendered with react 18',
    license: 'Apache-2.0',
    title: 'Interactive Instrument Stub (React 18)'
  },
  internal: {
    edition: 1,
    name: 'INTERACTIVE_INSTRUMENT_STUB_REACT_18'
  },
  kind: 'INTERACTIVE',
  language: 'en',
  measures: {},
  tags: ['Interactive'],
  validationSchema: z.object({ value: z.number() })
});
