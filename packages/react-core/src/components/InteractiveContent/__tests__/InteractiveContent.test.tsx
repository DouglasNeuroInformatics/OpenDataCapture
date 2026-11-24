import type { AnyUnilingualInteractiveInstrument, Language } from '@opendatacapture/runtime-core';
import type { Language as InterfaceLanguage } from '@opendatacapture/schemas/core';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { z } from 'zod/v4';

import { InteractiveContent } from '../InteractiveContent';

import type { InteractiveContentProps } from '../InteractiveContent';

const addNotification = vi.hoisted(() => vi.fn());
const changeLanguage = vi.hoisted(() => vi.fn());
const updateTheme = vi.hoisted(() => vi.fn());

vi.mock('@douglasneuroinformatics/libui/hooks', () => ({
  useNotificationsStore: (selector: (store: { addNotification: typeof addNotification }) => unknown) => {
    return selector({ addNotification });
  },
  useTheme: () => ['light', updateTheme],
  useTranslation: () => ({
    changeLanguage,
    resolvedLanguage: 'en',
    t: (value: string | { [key: string]: string }) => (typeof value === 'string' ? value : value.en)
  })
}));

const lockLanguage = vi.fn();
const requestFullscreen = vi.fn(() => Promise.resolve());
const exitFullscreen = vi.fn(() => Promise.resolve());

/** happy-dom implements no Fullscreen API, so it is installed here with `element` as the fullscreen element. */
function installFullscreen(element: Element | null) {
  Object.defineProperty(HTMLElement.prototype, 'requestFullscreen', { configurable: true, value: requestFullscreen });
  Object.defineProperty(document, 'exitFullscreen', { configurable: true, value: exitFullscreen });
  Object.defineProperty(document, 'fullscreenElement', { configurable: true, value: element });
}

function createInstrument({
  content = {},
  supportedLanguages = ['en']
}: {
  content?: Omit<AnyUnilingualInteractiveInstrument['content'], 'render'>;
  supportedLanguages?: Language[];
} = {}): InteractiveContentProps['instrument'] {
  return {
    __runtimeVersion: 1,
    content: {
      ...content,
      render: vi.fn()
    },
    details: {
      description: 'An interactive instrument under test',
      license: 'Apache-2.0',
      title: 'Interactive Instrument'
    },
    internal: { edition: 1, name: 'STUB_INTERACTIVE' },
    kind: 'INTERACTIVE',
    language: 'en',
    measures: null,
    supportedLanguages,
    tags: ['Test'],
    validationSchema: z.any()
  };
}

function renderInteractiveContent({
  content,
  language = 'en',
  onChangeLanguage = changeLanguage,
  onSubmit = vi.fn(),
  skipLanguageSelect = false,
  supportedLanguages
}: {
  content?: Omit<AnyUnilingualInteractiveInstrument['content'], 'render'>;
  language?: InterfaceLanguage;
  onChangeLanguage?: (language: InterfaceLanguage) => void;
  onSubmit?: InteractiveContentProps['onSubmit'];
  skipLanguageSelect?: boolean;
  supportedLanguages?: Language[];
} = {}) {
  return render(
    <InteractiveContent
      bundle="bundle text"
      instrument={createInstrument({ content, supportedLanguages })}
      language={language}
      skipLanguageSelect={skipLanguageSelect}
      onChangeLanguage={onChangeLanguage}
      onLockLanguage={lockLanguage}
      onSubmit={onSubmit}
    />
  );
}

function renderWithLanguageToggle({ enableLanguageLock }: { enableLanguageLock: boolean }) {
  renderInteractiveContent({
    content: { enableLanguageLock, enableLanguageToggle: true },
    supportedLanguages: ['en', 'fr']
  });
  fireEvent.keyDown(screen.getAllByRole('button').at(-1)!, { key: 'Enter' });
}

/** Dispatches a `CustomEvent` the way an instrument bundle running in the iframe would, on `document`. */
function dispatch<TDetail>(type: string, detail: TDetail) {
  document.dispatchEvent(new CustomEvent(type, { detail }));
}

describe('InteractiveContent', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
    Reflect.deleteProperty(HTMLElement.prototype, 'requestFullscreen');
    Reflect.deleteProperty(document, 'exitFullscreen');
    Reflect.deleteProperty(document, 'fullscreenElement');
    vi.restoreAllMocks();
  });

  it('should render the iframe directly when there is at most one supported language', () => {
    renderInteractiveContent({ supportedLanguages: ['en'] });
    expect(document.querySelector('iframe[data-bundle="bundle text"]')).toBeTruthy();
  });

  it('should show a language selection screen first when language selection is enabled for more than one language', () => {
    renderInteractiveContent({
      content: { enableLanguageSelect: true },
      supportedLanguages: ['en', 'fr']
    });
    expect(document.querySelector('iframe')).toBeNull();
    expect(screen.getByText('Select Language')).toBeTruthy();
  });

  it('should skip the language selection screen when the host has already settled the language', () => {
    renderInteractiveContent({
      content: { enableLanguageSelect: true },
      language: 'fr',
      skipLanguageSelect: true,
      supportedLanguages: ['en', 'fr']
    });
    expect(screen.queryByText('Select Language')).toBeNull();
    expect(screen.getByTitle('Open Data Capture - Interactive Instrument').getAttribute('lang')).toBe('fr');
  });

  it('should reveal the iframe once a language is chosen from the selection screen', () => {
    renderInteractiveContent({
      content: { enableLanguageSelect: true },
      supportedLanguages: ['en', 'fr']
    });
    fireEvent.click(screen.getAllByRole('button')[0]!);
    expect(changeLanguage).toHaveBeenCalled();
    expect(document.querySelector('iframe')).toBeTruthy();
  });

  it('should ask the host to hold the language a lock engages on as the instrument starts, so nothing outside can move it', () => {
    renderInteractiveContent({
      content: { enableLanguageLock: true },
      language: 'fr',
      supportedLanguages: ['en', 'fr']
    });
    expect(lockLanguage).toHaveBeenCalledExactlyOnceWith('fr');
  });

  it('should ask the host to hold the language picked on the selection screen, once a lock engages on it', () => {
    renderInteractiveContent({
      content: { enableLanguageLock: true, enableLanguageSelect: true },
      supportedLanguages: ['en', 'fr']
    });
    expect(lockLanguage).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: /Français/ }));
    expect(lockLanguage).toHaveBeenCalledExactlyOnceWith('fr');
  });

  it('should not ask the host to hold the language of an instrument that leaves it unlocked', () => {
    renderInteractiveContent({ supportedLanguages: ['en', 'fr'] });
    expect(lockLanguage).not.toHaveBeenCalled();
  });

  it("should call onSubmit with the event's parsed JSON detail when the bundle dispatches 'done'", async () => {
    const onSubmit = vi.fn();
    renderInteractiveContent({ onSubmit });
    await act(async () => {
      dispatch('done', { message: 'Hello' });
      await Promise.resolve();
    });
    expect(onSubmit).toHaveBeenCalledWith({ data: { message: 'Hello' }, kind: 'INTERACTIVE' });
  });

  it("should change the language when the bundle dispatches a 'changeLanguage' event for a supported language", () => {
    renderInteractiveContent();
    act(() => {
      dispatch('changeLanguage', 'fr');
    });
    expect(changeLanguage).toHaveBeenCalledWith('fr');
  });

  it("should notify an error rather than change the language when 'changeLanguage' requests an unsupported language", () => {
    renderInteractiveContent();
    act(() => {
      dispatch('changeLanguage', 'klingon');
    });
    expect(changeLanguage).not.toHaveBeenCalled();
    expect(addNotification).toHaveBeenCalledWith(expect.objectContaining({ type: 'error' }));
  });

  it('should open the lock dialog instead of changing language when the language is locked', () => {
    renderInteractiveContent({ content: { enableLanguageLock: true } });
    act(() => {
      dispatch('changeLanguage', 'fr');
    });
    expect(changeLanguage).not.toHaveBeenCalled();
    expect(screen.getByText('Cannot Change Language')).toBeTruthy();
  });

  it("should update the theme when the bundle dispatches a valid 'changeTheme' event", () => {
    renderInteractiveContent();
    act(() => {
      dispatch('changeTheme', 'dark');
    });
    expect(updateTheme).toHaveBeenCalledWith('dark');
  });

  it("should log an error rather than update the theme when 'changeTheme' carries an invalid value", () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    renderInteractiveContent();
    act(() => {
      dispatch('changeTheme', 'sepia');
    });
    expect(updateTheme).not.toHaveBeenCalled();
    expect(errorSpy).toHaveBeenCalled();
  });

  it("should forward an 'addNotification' event's detail to the notifications store", () => {
    renderInteractiveContent();
    act(() => {
      dispatch('addNotification', { message: 'From the bundle', type: 'success' });
    });
    expect(addNotification).toHaveBeenCalledWith({ message: 'From the bundle', type: 'success' });
  });

  it('should run the iframe in the language the host holds, whatever the interface language', () => {
    renderInteractiveContent({
      language: 'fr',
      onChangeLanguage: vi.fn(),
      supportedLanguages: ['en', 'fr']
    });
    expect(screen.getByTitle('Open Data Capture - Interactive Instrument').getAttribute('lang')).toBe('fr');
  });

  it("should hand a bundle's language change to the host holding the language, leaving the interface alone", () => {
    const onChangeLanguage = vi.fn();
    renderInteractiveContent({
      onChangeLanguage,
      supportedLanguages: ['en', 'fr']
    });
    act(() => {
      dispatch('changeLanguage', 'fr');
    });
    expect(onChangeLanguage).toHaveBeenCalledWith('fr');
    expect(changeLanguage).not.toHaveBeenCalled();
  });

  it('should zoom the iframe in and out within its lower bound', () => {
    renderInteractiveContent();
    expect(screen.getByText('100%')).toBeTruthy();
    const [zoomOut, zoomIn] = screen.getAllByRole('button');
    fireEvent.click(zoomIn!);
    expect(screen.getByText('125%')).toBeTruthy();
    fireEvent.click(zoomOut!);
    fireEvent.click(zoomOut!);
    fireEvent.click(zoomOut!);
    fireEvent.click(zoomOut!);
    // Clamped at 25: this fifth click in a row would otherwise take it to 0.
    fireEvent.click(zoomOut!);
    expect(screen.getByText('25%')).toBeTruthy();
  });

  it('should offer a language toggle only when more than one language is supported and toggling is enabled', () => {
    renderInteractiveContent({
      content: { enableLanguageToggle: true },
      supportedLanguages: ['en', 'fr']
    });
    expect(screen.getAllByRole('button').length).toBeGreaterThan(3);
  });

  it('should close the lock dialog when its OK button is clicked', () => {
    renderInteractiveContent({ content: { enableLanguageLock: true } });
    act(() => {
      dispatch('changeLanguage', 'fr');
    });
    expect(screen.getByText('Cannot Change Language')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'OK' }));
    expect(screen.queryByText('Cannot Change Language')).toBeNull();
  });

  it('should change the language from the toggle menu when the language is not locked', async () => {
    renderWithLanguageToggle({ enableLanguageLock: false });
    fireEvent.click(await screen.findByRole('menuitem', { name: 'French' }));
    expect(changeLanguage).toHaveBeenCalledWith('fr');
  });

  it('should open the lock dialog instead of changing language from the toggle menu when locked', async () => {
    renderWithLanguageToggle({ enableLanguageLock: true });
    fireEvent.click(await screen.findByRole('menuitem', { name: 'French' }));
    expect(changeLanguage).not.toHaveBeenCalled();
    expect(await screen.findByText('Cannot Change Language')).toBeTruthy();
  });

  it('should enter fullscreen on mount when the instrument asks to start fullscreen', () => {
    installFullscreen(null);
    renderInteractiveContent({ content: { defaultFullscreen: true } });
    expect(requestFullscreen.mock.contexts[0]).toBe(document.querySelector('iframe'));
  });

  it('should log an error and keep rendering when entering fullscreen on mount is refused', async () => {
    const rejection = new DOMException('Fullscreen error', 'NotAllowedError');
    requestFullscreen.mockRejectedValueOnce(rejection);
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    installFullscreen(null);
    renderInteractiveContent({ content: { defaultFullscreen: true } });
    await act(async () => {
      await Promise.resolve();
    });
    expect(errorSpy).toHaveBeenCalledExactlyOnceWith(rejection);
    expect(document.querySelector('iframe')).toBeTruthy();
  });

  it('should not enter fullscreen on mount unless the instrument asks to', () => {
    installFullscreen(null);
    renderInteractiveContent();
    expect(requestFullscreen).not.toHaveBeenCalled();
  });

  it('should put the iframe in fullscreen from the fullscreen button when nothing is fullscreen', () => {
    installFullscreen(null);
    renderInteractiveContent();
    fireEvent.click(screen.getAllByRole('button')[2]!);
    expect(requestFullscreen.mock.contexts[0]).toBe(document.querySelector('iframe'));
  });

  it('should leave fullscreen from the fullscreen button when already fullscreen', () => {
    renderInteractiveContent();
    installFullscreen(document.querySelector('iframe'));
    fireEvent.click(screen.getAllByRole('button')[2]!);
    expect(exitFullscreen).toHaveBeenCalledOnce();
    expect(requestFullscreen).not.toHaveBeenCalled();
  });
});
