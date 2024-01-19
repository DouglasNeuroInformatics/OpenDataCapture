import { useRef } from 'react';

import type { Json } from '@open-data-capture/common/core';
import type { InteractiveInstrument } from '@open-data-capture/common/instrument';
import type { Promisable } from 'type-fest';

import type { ContentWindow } from '../types';

export type InteractiveContentProps = {
  instrument: InteractiveInstrument;
  onSubmit: (data: Json) => Promisable<void>;
};

export const InteractiveContent = ({ instrument }: InteractiveContentProps) => {
  const ref = useRef<HTMLIFrameElement>(null);
  return (
    <iframe
      name="interactive-instrument"
      ref={ref}
      title="Open Data Capture - Interactive Instrument"
      onLoad={(event) => {
        const contentWindow: ContentWindow = event.currentTarget.contentWindow!;
        instrument.content.render.call(contentWindow);
      }}
    />
  );
};
