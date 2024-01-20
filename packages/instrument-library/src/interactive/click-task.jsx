const { InstrumentFactory } = await import('/runtime/v0.0.1/core.js');
const { default: React, useEffect, useRef, useState } = await import('/runtime/v0.0.1/react.js');
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
  /** @type {React.MutableRefObject<null | NodeJS.Timeout>} */
  const interval = useRef(null);

  useEffect(() => {
    interval.current = setInterval(() => {
      setSecondsRemaining((prev) => prev - 1);
    }, 1000);
    return () => {
      if (interval.current) {
        clearInterval(interval.current);
      }
    };
  }, []);

  useEffect(() => {
    if (0 > secondsRemaining && interval.current) {
      done({ count });
      clearInterval(interval.current);
    }
  }, [secondsRemaining]);

  return (
    <div className="click-task">
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
    assets: {
      css: [import.meta.injectStylesheet('./click-task.css')]
    },
    render() {
      const rootElement = document.createElement('div');
      document.body.appendChild(rootElement);
      const root = createRoot(rootElement);
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
