import React, { useCallback, useEffect, useRef, useState } from 'react';

import { Button, Dialog, DropdownMenu, Separator } from '@douglasneuroinformatics/libui/components';
import { useNotificationsStore, useTheme, useTranslation } from '@douglasneuroinformatics/libui/hooks';
import type { Theme } from '@douglasneuroinformatics/libui/hooks';
import type {
  InstrumentKind,
  InteractiveInstrument,
  Language,
  RuntimeNotification
} from '@opendatacapture/runtime-core';
import { $Json } from '@opendatacapture/schemas/core';
import type { Json } from '@opendatacapture/schemas/core';
import { ChevronRightIcon, FullscreenIcon, LanguagesIcon, ZoomInIcon, ZoomOutIcon } from 'lucide-react';
import type { Promisable, Simplify } from 'type-fest';

const ALL_LANGUAGES: { [K in Language]: { [P in Language]: string } } = {
  en: {
    en: 'English',
    fr: 'Anglais'
  },
  fr: {
    en: 'French',
    fr: 'Français'
  }
};

export type InteractiveContentSubmitResult = {
  data: Json;
  kind: Extract<InstrumentKind, 'INTERACTIVE'>;
};

export type InteractiveContentProps = Simplify<
  Pick<
    InteractiveInstrument['content'],
    'defaultFullscreen' | 'enableLanguageLock' | 'enableLanguageSelect' | 'enableLanguageToggle'
  > & {
    bundle: string;
    onSubmit: (result: InteractiveContentSubmitResult) => Promisable<void>;
    supportedLanguages?: Language[];
  }
>;

export const _InteractiveContent = React.memo<InteractiveContentProps>(function _InteractiveContent({
  bundle,
  defaultFullscreen,
  enableLanguageLock,
  enableLanguageSelect,
  enableLanguageToggle,
  onSubmit,
  supportedLanguages = []
}) {
  const addNotification = useNotificationsStore((store) => store.addNotification);
  const { changeLanguage, resolvedLanguage, t } = useTranslation();
  const [_, updateTheme] = useTheme();
  const [scale, setScale] = useState(100);
  const [hasSelectedLanguage, setHasSelectedLanguage] = useState(
    !enableLanguageSelect || supportedLanguages.length <= 1
  );
  const [lockDialogOpen, setLockDialogOpen] = useState(false);
  const iFrameRef = useRef<HTMLIFrameElement>(null);

  const isLocked = Boolean(enableLanguageLock) && hasSelectedLanguage;

  const handleChangeLanguageEvent = useCallback(
    (event: CustomEvent<Language>) => {
      if (event.detail !== 'en' && event.detail !== 'fr') {
        console.error(`Cannot change language: invalid language '${event.detail}', expected 'en' or 'fr'`);
        return;
      }
      if (isLocked) {
        setLockDialogOpen(true);
        return;
      }
      void changeLanguage(event.detail);
    },
    [changeLanguage, isLocked]
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
        await onSubmit({ data, kind: 'INTERACTIVE' });
      })();
    },
    [onSubmit]
  );

  const handleToggleFullScreen = async () => {
    if (!document.fullscreenElement) {
      await iFrameRef.current?.requestFullscreen();
    } else {
      await document.exitFullscreen();
    }
  };

  useEffect(() => {
    if (defaultFullscreen && hasSelectedLanguage) {
      void iFrameRef.current?.requestFullscreen();
    }
  }, [hasSelectedLanguage]);

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

  useEffect(() => {
    const handler = (event: CustomEvent<RuntimeNotification>) => addNotification(event.detail);
    document.addEventListener('addNotification', handler, false);
    return () => document.removeEventListener('addNotification', handler, false);
  }, []);

  const dimensions = `${(100 / scale) * 100}%`;

  return (
    <div className="flex h-full w-full flex-col">
      {hasSelectedLanguage ? (
        <>
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
            {enableLanguageToggle && supportedLanguages?.length > 1 && (
              <DropdownMenu>
                <DropdownMenu.Trigger asChild>
                  <Button size="icon" type="button" variant="outline">
                    <LanguagesIcon />
                  </Button>
                </DropdownMenu.Trigger>
                <DropdownMenu.Content align="end">
                  {supportedLanguages.map((language) => (
                    <DropdownMenu.Item
                      key={language}
                      onSelect={() => {
                        if (isLocked) {
                          setLockDialogOpen(true);
                          return;
                        }
                        changeLanguage(language);
                      }}
                    >
                      {ALL_LANGUAGES[language][resolvedLanguage]}
                    </DropdownMenu.Item>
                  ))}
                </DropdownMenu.Content>
              </DropdownMenu>
            )}
          </div>
          <div className="h-full w-full overflow-hidden rounded-md border border-slate-300 dark:border-slate-700">
            <iframe
              allow="fullscreen"
              className="origin-top-left"
              data-bundle={bundle}
              lang={resolvedLanguage}
              name="interactive-instrument"
              ref={iFrameRef}
              src="/runtime/v1/@opendatacapture/runtime-internal/interactive/iframe.html"
              style={{ backgroundColor: 'white', height: dimensions, scale: `${scale}%`, width: dimensions }}
              title="Open Data Capture - Interactive Instrument"
            />
          </div>
        </>
      ) : (
        <div className="flex h-full w-full items-center justify-center p-6">
          <div className="flex w-full max-w-lg flex-col gap-8">
            <h2 className="text-center text-2xl font-semibold tracking-tight">
              {t({ en: 'Select Language', fr: 'Sélectionnez une langue' })}
            </h2>
            <div className="flex flex-col gap-2.5">
              {supportedLanguages.map((language) => {
                const otherLanguage = (Object.keys(ALL_LANGUAGES) as Language[]).find((l) => l !== language);
                return (
                  <button
                    className="group flex items-center justify-between rounded-lg border border-slate-200 px-5 py-4 text-left transition-colors hover:border-slate-300 hover:bg-slate-50 focus-visible:outline-none dark:border-slate-700 dark:hover:bg-slate-900/50"
                    key={language}
                    type="button"
                    onClick={() => {
                      void changeLanguage(language);
                      setHasSelectedLanguage(true);
                    }}
                  >
                    <div className="flex flex-col gap-0.5">
                      <span className="text-base font-medium">{ALL_LANGUAGES[language][language]}</span>
                      {otherLanguage && (
                        <span className="text-muted-foreground text-xs">{ALL_LANGUAGES[language][otherLanguage]}</span>
                      )}
                    </div>
                    <ChevronRightIcon className="text-muted-foreground group-hover:text-foreground h-5 w-5 transition-transform group-hover:translate-x-0.5" />
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
      <Dialog open={lockDialogOpen} onOpenChange={setLockDialogOpen}>
        <Dialog.Content onOpenAutoFocus={(event) => event.preventDefault()}>
          <Dialog.Header>
            <Dialog.Title>{t({ en: 'Cannot Change Language', fr: 'Impossible de changer la langue' })}</Dialog.Title>
            <Dialog.Description>
              {t({
                en: 'The language cannot be changed during this instrument.',
                fr: 'La langue ne peut pas être modifiée pendant cet instrument.'
              })}
            </Dialog.Description>
          </Dialog.Header>
          <Dialog.Footer>
            <Button type="button" variant="primary" onClick={() => setLockDialogOpen(false)}>
              {t({ en: 'OK', fr: 'OK' })}
            </Button>
          </Dialog.Footer>
        </Dialog.Content>
      </Dialog>
    </div>
  );
});

export const InteractiveContent = React.memo<InteractiveContentProps>(function InteractiveContent(props) {
  return <_InteractiveContent {...props} />;
});
