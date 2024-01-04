const { InstrumentFactory } = await import('/runtime/v0.0.1/core.js');
const { useEffect, useState } = await import('/runtime/v0.0.1/react.js').then((module) => module.default);
const { z } = await import('/runtime/v0.0.1/zod.js');

type ClickTaskData = {
  count: number;
};

const instrumentFactory = new InstrumentFactory({
  kind: 'interactive',
  language: 'en'
});

export default instrumentFactory.defineInstrument<ClickTaskData>({
  content: {
    render: (done) => {
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
    }
  },
  details: {
    description: 'This task is completely useless. It is a proof of concept for an interactive instrument.',
    estimatedDuration: 1,
    instructions:
      'When you begin this task, a 10 second countdown will begin. Please click the button as many times as you can before it expires.',
    title: 'Click Task'
  },
  name: 'InteractiveInstrument',
  tags: ['Interactive'],
  validationSchema: z.any(),
  version: 1.0
});
