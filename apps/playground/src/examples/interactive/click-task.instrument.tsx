type ClickTaskData = {
  count: number;
};

const clickTask: InteractiveInstrument<ClickTaskData, 'en'> = {
  content: {
    render: (done) => {
      const [count, setCount] = React.useState(0);
      const [secondsRemaining, setSecondsRemaining] = React.useState(10);

      React.useEffect(() => {
        const id = setInterval(() => {
          setSecondsRemaining((prev) => prev - 1);
        }, 1000);
        return () => clearInterval(id);
      }, []);

      React.useEffect(() => {
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
  kind: 'interactive',
  language: 'en',
  name: 'InteractiveInstrument',
  tags: ['Interactive'],
  validationSchema: z.any(),
  version: 1.0
};

export default clickTask;
