const { InstrumentFactory } = await import('/runtime/v0.0.1/core.js');
const { default: React, useEffect, useRef, useState } = await import('/runtime/v0.0.1/react.js');
const { createRoot } = await import('/runtime/v0.0.1/react-dom/client.js');
const { z } = await import('/runtime/v0.0.1/zod.js');

type ClickTaskProps = { done: (data: { count: number }) => void };

const ClickTask = ({ done }: ClickTaskProps) => {
  const [count, setCount] = useState(0);
  const [secondsRemaining, setSecondsRemaining] = useState(10);
  // Conflict between type of timer in Node and DOM
  const interval = useRef<any>(null);

  useEffect(() => {
    interval.current = setInterval(() => {
      if (secondsRemaining > 0) {
        setSecondsRemaining((prev) => prev - 1);
      }
    }, 1000);
    return () => {
      interval.current && clearInterval(interval.current);
    };
  }, []);

  useEffect(() => {
    if (secondsRemaining === 0 && interval.current) {
      done({ count });
      clearInterval(interval.current);
    }
  }, [secondsRemaining]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <span>Seconds Remaining: {secondsRemaining}</span>
      <span>Count: {count}</span>
      <button
        onClick={() => {
          setCount(count + 1);
        }}
      >
        Increase Count
      </button>
    </div>
  );
};

const instrumentFactory = new InstrumentFactory({
  kind: 'INTERACTIVE',
  language: 'en',
  validationSchema: z.object({
    count: z.number().int()
  })
});

export default instrumentFactory.defineInstrument({
  content: {
    render(done) {
      const rootElement = document.createElement('div');
      document.body.appendChild(rootElement);
      const root = createRoot(rootElement);
      root.render(<ClickTask done={(data) => done(data)} />);
    }
  },
  details: {
    description: 'This task is completely useless. It is a proof of concept for an interactive instrument.',
    estimatedDuration: 1,
    instructions: [
      'When you begin this task, a 10 second countdown will begin. Please click the button as many times as you can before it expires.'
    ],
    license: 'AGPL-3.0',
    title: 'Click Task'
  },
  measures: {
    count: {
      kind: 'const',
      label: 'Count',
      ref: 'count'
    }
  },
  name: 'InteractiveInstrument',
  tags: ['Interactive'],
  version: 1.0
});
