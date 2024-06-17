import React, { useCallback, useEffect, useState } from 'react';

import { Button } from '@douglasneuroinformatics/libui/components';
import { $Json, type Json } from '@opendatacapture/schemas/core';
import { ZoomInIcon, ZoomOutIcon } from 'lucide-react';
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
  const [scale, setScale] = useState(100);
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

  const dimensions = `${(100 / scale) * 100}%`;

  return (
    <div className="flex h-full w-full flex-col">
      <div className="text-muted-foreground mb-2 flex items-center justify-end gap-2">
        <span className="text-foreground-muted text-sm">{scale}%</span>
        <Button size="icon" type="button" variant="outline" onClick={() => setScale(scale - 25)}>
          <ZoomOutIcon />
        </Button>
        <Button size="icon" type="button" variant="outline" onClick={() => setScale(scale + 25)}>
          <ZoomInIcon />
        </Button>
      </div>
      <div className="h-full w-full overflow-hidden rounded-md border border-slate-300 dark:border-slate-700">
        <iframe
          allow="fullscreen"
          className="origin-top-left"
          data-bundle={bundle}
          name="interactive-instrument"
          srcDoc={`<script type="module">${bootstrapScript}</script>`}
          style={{ height: dimensions, scale: `${scale}%`, width: dimensions }}
          title="Open Data Capture - Interactive Instrument"
        />
      </div>
    </div>
  );
});
