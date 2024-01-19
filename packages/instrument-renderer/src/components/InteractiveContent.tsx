import { useRef } from 'react';

import type { Json } from '@open-data-capture/common/core';
import type { Promisable } from 'type-fest';

export type InteractiveContentProps = {
  bundle: string;
  onSubmit: (data: Json) => Promisable<void>;
};

export const InteractiveContent = ({ bundle }: InteractiveContentProps) => {
  const ref = useRef<HTMLIFrameElement>(null);

  return (
    <iframe
      data-bundle={bundle}
      name="interactive-instrument"
      ref={ref}
      srcDoc='<script src="/runtime/v0.0.1/_internal/bootstrap.js" type="module"></script>'
      title="Open Data Capture - Interactive Instrument"
      onLoad={(event) => {
        const contentWindow = event.currentTarget.contentWindow;
        if (!contentWindow) {
          console.error('content window cannot be null');
          return;
        }
        contentWindow.postMessage({ payload: bundle, type: 'begin' });
      }}
    />
  );
};
