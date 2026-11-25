import React, { useCallback, useEffect, useRef, useState } from 'react';

import { Button, Dialog, DropdownMenu, Separator } from '@douglasneuroinformatics/libui/components';
import { useNotificationsStore, useTheme, useTranslation } from '@douglasneuroinformatics/libui/hooks';
import type { Theme } from '@douglasneuroinformatics/libui/hooks';
import type {
  AnyUnilingualInteractiveInstrument,
  InstrumentKind,
  Language,
  RuntimeNotification
} from '@opendatacapture/runtime-core';
import { $InstrumentAuthoringLanguage, $Json } from '@opendatacapture/schemas/core';
import type { Language as InterfaceLanguage, Json } from '@opendatacapture/schemas/core';
import { ChevronRightIcon, FullscreenIcon, LanguagesIcon, ZoomInIcon, ZoomOutIcon } from 'lucide-react';
import type { Promisable } from 'type-fest';

import { LANGUAGE_LABELS } from '../../utils/language';

// eslint-disable-next-line react/function-component-definition -- the named function passed to memo gives the component its display name
const _InteractiveContent = React.memo<InteractiveContentProps>(function _InteractiveContent({
  bundle,
  instrument,
  language,
  onChangeLanguage,
  onLockLanguage,
  onSubmit,
  skipLanguageSelect
}) {
  const { defaultFullscreen, enableLanguageLock, enableLanguageSelect, enableLanguageToggle } = instrument.content;
  const { supportedLanguages } = instrument;
  const addNotification = useNotificationsStore((store) => store.addNotification);
  const { resolvedLanguage, t } = useTranslation();
  const [_, updateTheme] = useTheme();
  const [scale, setScale] = useState(100);
  const [selectedLanguage, setSelectedLanguage] = useState(
    !enableLanguageSelect || skipLanguageSelect || supportedLanguages.length <= 1 ? language : null
  );
  const [lockDialogOpen, setLockDialogOpen] = useState(false);
  const iFrameRef = useRef<HTMLIFrameElement>(null);

  const hasSelectedLanguage = selectedLanguage !== null;
  const isLocked = Boolean(enableLanguageLock) && hasSelectedLanguage;

  // A fullscreened iframe does not receive keyboard focus: the browser leaves focus wherever it
  // was in this document, so an instrument that listens for key presses on its own document stays
  // unresponsive until the participant clicks inside the frame. Focusing the frame moves focus into
  // the document the instrument runs in, which is where its key listeners are.
  const handleFocusIFrame = useCallback(() => {
    iFrameRef.current?.focus();
    iFrameRef.current?.contentWindow?.focus();
  }, []);

  // The payload crosses from an instrument bundle running in the iframe, so it is parsed rather
  // than trusted — an instrument may only ask for a language instruments can be authored in.
  const handleChangeLanguageEvent = useCallback(
    (event: CustomEvent<InterfaceLanguage>) => {
      const requested = $InstrumentAuthoringLanguage.safeParse(event.detail);
      if (!requested.success) {
        addNotification({
          message: t({
            en: `This instrument requested an unsupported language: ${event.detail}`,
            es: `Este instrumento solicitó un idioma no admitido: ${event.detail}`,
            fr: `Cet instrument a demandé une langue non prise en charge : ${event.detail}`
          }),
          type: 'error'
        });
        return;
      }
      if (isLocked) {
        setLockDialogOpen(true);
        return;
      }
      onChangeLanguage(requested.data);
    },
    [addNotification, isLocked, onChangeLanguage, t]
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
      iFrameRef.current?.requestFullscreen().catch((error: unknown) => {
        console.error(error);
      });
    }
  }, [hasSelectedLanguage]);

  // Covers both entering and leaving fullscreen, however it was triggered: the button here, the
  // instrument asking to start fullscreen, or the participant pressing escape.
  useEffect(() => {
    const handler = () => {
      if (!document.fullscreenElement || document.fullscreenElement === iFrameRef.current) {
        handleFocusIFrame();
      }
    };
    document.addEventListener('fullscreenchange', handler, false);
    return () => document.removeEventListener('fullscreenchange', handler, false);
  }, [handleFocusIFrame]);

  useEffect(() => {
    if (enableLanguageLock && selectedLanguage) {
      onLockLanguage(selectedLanguage);
    }
  }, [selectedLanguage]);

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
            {enableLanguageToggle && supportedLanguages.length > 1 && (
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
                        onChangeLanguage(language);
                      }}
                    >
                      {LANGUAGE_LABELS[language][resolvedLanguage]}
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
              lang={language}
              name="interactive-instrument"
              ref={iFrameRef}
              src="/runtime/v1/@opendatacapture/runtime-internal/interactive/iframe.html"
              style={{ backgroundColor: 'white', height: dimensions, scale: `${scale}%`, width: dimensions }}
              title="Open Data Capture - Interactive Instrument"
              onLoad={handleFocusIFrame}
            />
          </div>
        </>
      ) : (
        <div className="flex h-full w-full items-center justify-center p-6">
          <div className="flex w-full max-w-lg flex-col gap-8">
            <h2 className="text-center text-2xl font-semibold tracking-tight">
              {t({ en: 'Select Language', es: 'Seleccionar idioma', fr: 'Sélectionnez une langue' })}
            </h2>
            <div className="flex flex-col gap-2.5">
              {supportedLanguages.map((language) => {
                const otherLanguage = supportedLanguages.find((supported) => supported !== language);
                return (
                  <button
                    className="group flex items-center justify-between rounded-lg border border-slate-200 px-5 py-4 text-left transition-colors hover:border-slate-300 hover:bg-slate-50 focus-visible:outline-none dark:border-slate-700 dark:hover:bg-slate-900/50"
                    key={language}
                    type="button"
                    onClick={() => {
                      onChangeLanguage(language);
                      setSelectedLanguage(language);
                    }}
                  >
                    <div className="flex flex-col gap-0.5">
                      <span className="text-base font-medium">{LANGUAGE_LABELS[language][language]}</span>
                      {otherLanguage && (
                        <span className="text-muted-foreground text-xs">
                          {LANGUAGE_LABELS[language][otherLanguage]}
                        </span>
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
            <Dialog.Title>
              {t({
                en: 'Cannot Change Language',
                es: 'No se puede cambiar el idioma',
                fr: 'Impossible de changer la langue'
              })}
            </Dialog.Title>
            <Dialog.Description>
              {t({
                en: 'The language cannot be changed during this instrument.',
                es: 'El idioma no se puede cambiar mientras se administra este instrumento.',
                fr: 'La langue ne peut pas être modifiée pendant cet instrument.'
              })}
            </Dialog.Description>
          </Dialog.Header>
          <Dialog.Footer>
            <Button type="button" variant="primary" onClick={() => setLockDialogOpen(false)}>
              {t({ en: 'OK', es: 'Aceptar', fr: 'OK' })}
            </Button>
          </Dialog.Footer>
        </Dialog.Content>
      </Dialog>
    </div>
  );
});

export type InteractiveContentSubmitResult = {
  data: Json;
  kind: Extract<InstrumentKind, 'INTERACTIVE'>;
};

export type InteractiveContentProps = {
  bundle: string;
  instrument: AnyUnilingualInteractiveInstrument & { supportedLanguages: Language[] };
  /** The language the instrument runs in, held by the host instead of the interface language. */
  language: InterfaceLanguage;
  onChangeLanguage: (language: InterfaceLanguage) => void;
  /**
   * Called with the language a lock engages on. The host holds the instrument to it from then on,
   * since a host whose language follows the interface would otherwise move it when that changes.
   */
  onLockLanguage: (language: InterfaceLanguage) => void;
  onSubmit: (result: InteractiveContentSubmitResult) => Promisable<void>;
  /** Whether the host already settled the language, skipping the instrument's own selection screen. */
  skipLanguageSelect: boolean;
};

// eslint-disable-next-line react/function-component-definition -- the named function passed to memo gives the component its display name
export const InteractiveContent = React.memo<InteractiveContentProps>(function InteractiveContent(props) {
  return <_InteractiveContent {...props} />;
});
