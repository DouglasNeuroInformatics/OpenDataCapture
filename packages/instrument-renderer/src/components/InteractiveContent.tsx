import type { Json } from '@open-data-capture/common/core';
import type { InteractiveInstrument } from '@open-data-capture/common/instrument';
import type { Promisable } from 'type-fest';

export type InteractiveContentProps = {
  instrument: InteractiveInstrument;
  onSubmit: (data: Json) => Promisable<void>;
};

export const InteractiveContent = ({ instrument, onSubmit }: InteractiveContentProps) => {
  return <iframe srcDoc="Hello World" title="Open Data Capture - Interactive Instrument" />;
};
