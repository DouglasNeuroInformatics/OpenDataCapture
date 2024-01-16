export type InstrumentRendererProps = {
  bundle: string;
  onSubmit: (data: unknown) => Promise<void>;
};

export const InstrumentRenderer = () => {
  return (
    <>
      <iframe srcDoc="Hello World" title="Open Data Capture - Interactive Instrument" />
      <p>{}</p>
    </>
  );
};
