import type { InteractiveInstrument } from '@open-data-capture/common/instrument';

export type InteractiveRendererProps = {
  instrument: InteractiveInstrument;
  onSubmit: (data: unknown) => Promise<void>;
};

export const InstrumentSandbox = () => {
  return <iframe srcDoc="Hello World" title="Open Data Capture - Interactive Instrument" />;
};
