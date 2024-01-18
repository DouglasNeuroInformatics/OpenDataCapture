const { InstrumentFactory } = await import('/runtime/v0.0.1/core.js');
const { default: React, useEffect, useState } = await import('/runtime/v0.0.1/react.js');
const { createRoot } = await import('/runtime/v0.0.1/react-dom/client.js');
const { z } = await import('/runtime/v0.0.1/zod.js');

/**
 * This component renders a greeting to the user.
 *
 * @param {Object} props
 * @param {(data: { count: number }) => void} props.done
 */
const ClickTask = ({ done }) => {
  const [count, setCount] = useState(0);
  const [secondsRemaining, setSecondsRemaining] = useState(10);

  useEffect(() => {
    const id = setInterval(() => {
      setSecondsRemaining((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (0 > secondsRemaining) {
      done({ count });
    }
  }, [secondsRemaining]);

  return (
    <div className="flex flex-col">
      <span>Seconds Remaining: {secondsRemaining}</span>
      <span>Count: {Math.max(count, 0)}</span>
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
  validationSchema: z.any()
});

export default instrumentFactory.defineInstrument({
  content: {
    render: (ref) => {
      
      console.log({ ref });
      const rootElement = document.createElement('div');
      document.body.appendChild(rootElement);
      const root = createRoot(document.body);
      // eslint-disable-next-line no-alert
      root.render(<ClickTask done={(data) => alert(JSON.stringify(data))} />);
    }
  },
  details: {
    description: 'This task is completely useless. It is a proof of concept for an interactive instrument.',
    estimatedDuration: 1,
    instructions: [
      'When you begin this task, a 10 second countdown will begin. Please click the button as many times as you can before it expires.'
    ],
    title: 'Click Task'
  },
  name: 'InteractiveInstrument',
  tags: ['Interactive'],
  version: 1.0
});
