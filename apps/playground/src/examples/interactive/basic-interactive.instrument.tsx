const basicInteractiveInstrument: InteractiveInstrument = {
  content: {
    render: () => {
      return <h1>Hello World</h1>;
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
