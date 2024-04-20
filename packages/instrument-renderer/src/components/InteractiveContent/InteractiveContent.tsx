import React, { useCallback, useEffect, useRef, useState } from 'react';

import { useTheme } from '@douglasneuroinformatics/libui/hooks';
import { $Json, type Json } from '@opendatacapture/schemas/core';
import type { Promisable } from 'type-fest';

import bootstrapScript from './bootstrap?raw';

export type InteractiveContentProps = {
  bundle: string;
  onSubmit: (data: Json) => Promisable<void>;
};

export const InteractiveContent = ({ bundle, onSubmit }: InteractiveContentProps) => {
  const [theme] = useTheme();
  const ref = useRef<HTMLIFrameElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);

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

  useEffect(() => {
    if (isLoaded) {
      ref.current!.contentDocument!.documentElement.setAttribute('data-mode', theme);
    }
  }, [isLoaded, theme]);

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
        setIsLoaded(true);
        contentWindow.document.documentElement.setAttribute('data-mode', theme);
        contentWindow.postMessage({ payload: bundle, type: 'begin' });
      }}
    />
  );
};
