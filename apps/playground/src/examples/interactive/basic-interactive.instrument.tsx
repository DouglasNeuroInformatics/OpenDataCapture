const basicInteractiveInstrument: InteractiveInstrument = {
  content: {
    render: () => {
      const [count, setCount] = React.useState(0);
      return (
        <div>
          <p>Count: {count}</p>
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
    description: 'This is the simplest possible interactive instrument',
    title: 'Interactive Instrument'
  },
  kind: 'interactive',
  language: 'en',
  name: 'InteractiveInstrument',
  tags: ['Interactive'],
  validationSchema: z.any(),
  version: 1.0
};

export default basicInteractiveInstrument;
