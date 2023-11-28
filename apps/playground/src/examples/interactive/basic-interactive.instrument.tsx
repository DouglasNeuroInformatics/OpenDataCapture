type ClickTaskData = {
  count: number;
};

const clickTask: InteractiveInstrument<ClickTaskData, 'en'> = {
  content: {
    render: (done) => {
      const [count, setCount] = React.useState(0);
      return (
        <div className="flex flex-col">
          <div>
            <h1 className="text-center text-lg font-semibold">Click Task</h1>
            <p>Instructions: Please click the button as many times as possible in the allotted time</p>
            <p>Count: {count}</p>
          </div>
          <button
            onClick={() => {
              setCount(count + 1);
            }}
          >
            Increase Count
          </button>
          <button type="button" onClick={() => done({ count })}>
            Done
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
