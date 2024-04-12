import React, { useCallback, useEffect, useRef } from 'react';

import { $Json, type Json } from '@opendatacapture/schemas/core';
import type { Promisable } from 'type-fest';

import bootstrapScript from '../scripts/bootstrap-interactive-content?raw';

export type InteractiveContentProps = {
  bundle: string;
  onSubmit: (data: Json) => Promisable<void>;
};

export const InteractiveContent = ({ bundle, onSubmit }: InteractiveContentProps) => {
  const ref = useRef<HTMLIFrameElement>(null);

  const handler = useCallback(
    (event: CustomEvent) => {
      void (async function () {
        const data = await $Json.parseAsync(event.detail);
        await onSubmit(data);
      })();
    },
    [onSubmit]
  );

  useEffect(() => {
    document.addEventListener('done', handler, false);
    return () => document.removeEventListener('done', handler, false);
  }, [handler]);

  return (
    <iframe
      allow="fullscreen"
      className="h-full w-full rounded-md border border-slate-300 dark:border-slate-700"
      data-bundle={bundle}
      name="interactive-instrument"
      ref={ref}
      srcDoc={`<script type="module">${bootstrapScript}</script>`}
      title="Open Data Capture - Interactive Instrument"
      onLoad={(event) => {
        const contentWindow: Window | null = event.currentTarget.contentWindow;
        if (!contentWindow) {
          console.error('content window cannot be null');
          return;
        }
        contentWindow.postMessage({ payload: bundle, type: 'begin' });
      }}
    />
  );
};
