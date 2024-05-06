import React, { useCallback, useEffect } from 'react';

import { $Json, type Json } from '@opendatacapture/schemas/core';
import type { Promisable } from 'type-fest';

import bootstrapScript from './bootstrap?raw';

export type InteractiveContentProps = {
  bundle: string;
  onSubmit: (data: Json) => Promisable<void>;
};

export const InteractiveContent = React.memo<InteractiveContentProps>(function InteractiveContent({
  bundle,
  onSubmit
}) {
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
      srcDoc={`<script type="module">${bootstrapScript}</script>`}
      title="Open Data Capture - Interactive Instrument"
    />
  );
});
