import React, { useCallback, useEffect, useState } from 'react';

import { Button, Separator } from '@douglasneuroinformatics/libui/components';
import { type Theme, useTheme, useTranslation } from '@douglasneuroinformatics/libui/hooks';
import type { Language } from '@opendatacapture/runtime-core';
import { $Json, type Json } from '@opendatacapture/schemas/core';
import { FullscreenIcon, ZoomInIcon, ZoomOutIcon } from 'lucide-react';
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
  const { changeLanguage } = useTranslation();
  const [_, updateTheme] = useTheme();
  const [scale, setScale] = useState(100);

  const handleChangeLanguageEvent = useCallback(
    (event: CustomEvent<Language>) => {
      if (event.detail === 'en' || event.detail === 'fr') {
        void changeLanguage(event.detail);
      } else {
        console.error(`Cannot change language: invalid language '${event.detail}', expected 'en' or 'fr'`);
      }
    },
    [updateTheme]
  );

  const handleChangeThemeEvent = useCallback(
    (event: CustomEvent<Theme>) => {
      if (event.detail === 'dark' || event.detail === 'light') {
        updateTheme(event.detail);
      } else {
        console.error(`Cannot change theme: invalid theme '${event.detail}', expected 'dark' or 'light'`);
      }
    },
    [updateTheme]
  );

  const handleDoneEvent = useCallback(
    (event: CustomEvent<Json>) => {
      void (async function () {
        const data = await $Json.parseAsync(event.detail);
        await onSubmit(data);
      })();
    },
    [onSubmit]
  );

  const handleToggleFullScreen = async () => {
    if (!document.fullscreenElement) {
      await document.documentElement.requestFullscreen();
    } else if (document.exitFullscreen) {
      await document.exitFullscreen();
    }
  };

  useEffect(() => {
    document.addEventListener('changeLanguage', handleChangeLanguageEvent, false);
    return () => document.removeEventListener('changeLanguage', handleChangeLanguageEvent, false);
  }, [handleChangeLanguageEvent]);

  useEffect(() => {
    document.addEventListener('changeTheme', handleChangeThemeEvent, false);
    return () => document.removeEventListener('changeTheme', handleChangeThemeEvent, false);
  }, [handleChangeThemeEvent]);

  useEffect(() => {
    document.addEventListener('done', handleDoneEvent, false);
    return () => document.removeEventListener('done', handleDoneEvent, false);
  }, [handleDoneEvent]);

  const dimensions = `${(100 / scale) * 100}%`;

  return (
    <div className="flex h-full w-full flex-col">
      <div className="text-muted-foreground mb-2 flex items-center justify-end gap-2">
        <span className="text-foreground-muted text-sm">{scale}%</span>
        <Button
          size="icon"
          type="button"
          variant="outline"
          onClick={() => {
            if (scale > 25) {
              setScale(scale - 25);
            }
          }}
        >
          <ZoomOutIcon />
        </Button>
        <Button size="icon" type="button" variant="outline" onClick={() => setScale(scale + 25)}>
          <ZoomInIcon />
        </Button>
        <Separator className="mx-1 h-6" orientation="vertical" />
        <Button size="icon" type="button" variant="outline" onClick={() => void handleToggleFullScreen()}>
          <FullscreenIcon />
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
