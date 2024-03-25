import { useCallback, useEffect, useRef } from 'react';

import { useLegacyStepper } from '@douglasneuroinformatics/libui/hooks';
import { $Json, type Json } from '@open-data-capture/schemas/core';
import type { Promisable } from 'type-fest';

export type InteractiveContentProps = {
  bundle: string;
  onSubmit: (data: Json) => Promisable<void>;
};

export const InteractiveContent = ({ bundle, onSubmit }: InteractiveContentProps) => {
  const { updateIndex } = useLegacyStepper();
  const ref = useRef<HTMLIFrameElement>(null);

  const handler = useCallback(
    (event: CustomEvent) => {
      void (async function () {
        const data = await $Json.parseAsync(event.detail);
        await onSubmit(data);
        updateIndex('increment');
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
      srcDoc='<script src="/runtime/v0.0.1/_internal/bootstrap.js" type="module"></script>'
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
