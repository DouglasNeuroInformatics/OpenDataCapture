// @vitest-environment happy-dom

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { BaseTranslator, StandaloneTranslator, SynchronizedTranslator } from '../i18n.js';

import type { Language } from '../types/core.js';

const translations = {
  greetings: {
    hello: { en: 'Hello', fr: 'Bonjour' }
  },
  untranslated: 'Untranslated'
};

const partialTranslations: { [key: string]: unknown } = {
  onlyEnglish: { en: 'Only English' }
};

class UninitializedTranslator extends BaseTranslator {
  changeLanguage() {
    return;
  }

  readLanguageProperty(element: Element) {
    return this.extractLanguageProperty(element);
  }
}

function flushMutations() {
  return new Promise((resolve) => setTimeout(resolve));
}

function mountInstrumentFrame(name: string) {
  const iframe = document.createElement('iframe');
  iframe.setAttribute('name', name);
  iframe.setAttribute('lang', 'en');
  Object.defineProperty(window, 'frameElement', { configurable: true, value: iframe });
  return iframe;
}

beforeEach(() => {
  document.documentElement.setAttribute('lang', 'en');
});

afterEach(() => {
  vi.unstubAllGlobals();
  Reflect.deleteProperty(window, 'frameElement');
  vi.restoreAllMocks();
});

describe('Translator', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it('should be the StandaloneTranslator in a top-level browser window', async () => {
    const { StandaloneTranslator, Translator } = await import('../i18n.js');
    expect(Translator).toBe(StandaloneTranslator);
  });

  it('should be the SynchronizedTranslator inside a frame, so it follows the host language', async () => {
    vi.stubGlobal('window', { self: {}, top: {} });
    const { SynchronizedTranslator, Translator } = await import('../i18n.js');
    expect(Translator).toBe(SynchronizedTranslator);
  });

  it('should be the SynchronizedTranslator outside of a browser', async () => {
    vi.stubGlobal('window', undefined);
    const { SynchronizedTranslator, Translator } = await import('../i18n.js');
    expect(Translator).toBe(SynchronizedTranslator);
  });
});

describe('BaseTranslator', () => {
  it('should refuse to translate before initialization', () => {
    const translator = new StandaloneTranslator({ translations });
    expect(() => translator.t('untranslated')).toThrow(
      "Cannot access method 't' of Translator before initialization in browser"
    );
  });

  it('should refuse to resolve the language before initialization', () => {
    const translator = new StandaloneTranslator({ translations });
    expect(() => translator.resolvedLanguage).toThrow(
      "Cannot access getter 'resolvedLanguage' of Translator before initialization in browser"
    );
  });

  it('should refuse a language change handler before initialization', () => {
    const translator = new StandaloneTranslator({ translations });
    expect(() => {
      translator.onLanguageChange = vi.fn();
    }).toThrow("Cannot access setter 'onLanguageChange' of Translator before initialization in browser");
  });

  it('should refuse to read a lang attribute before initialization', () => {
    const translator = new UninitializedTranslator({ translations });
    expect(() => translator.readLanguageProperty(document.documentElement)).toThrow(
      "Cannot access method 'extractLanguageProperty' of Translator before initialization in browser"
    );
  });

  it('should report initialization once init has run', () => {
    const translator = new StandaloneTranslator({ translations });
    expect(translator.isInitialized).toBe(false);
    translator.init();
    expect(translator.isInitialized).toBe(true);
  });

  it('should resolve the language from the lang attribute of the target element', () => {
    document.documentElement.setAttribute('lang', 'fr');
    const translator = new StandaloneTranslator({ translations });
    translator.init();
    expect(translator.resolvedLanguage).toBe('fr');
  });

  it('should fall back to English when the lang attribute is unsupported and no fallback is given', () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    document.documentElement.setAttribute('lang', 'de');
    const translator = new StandaloneTranslator({ translations });
    translator.init();
    expect(translator.resolvedLanguage).toBe('en');
  });

  it('should fall back to the configured fallback language when the lang attribute is unsupported', () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    document.documentElement.setAttribute('lang', 'de');
    const translator = new StandaloneTranslator({ fallbackLanguage: 'fr', translations });
    translator.init();
    expect(translator.resolvedLanguage).toBe('fr');
  });

  it('should log an unsupported lang attribute, so a misconfigured document is visible', () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    document.documentElement.setAttribute('lang', 'de');
    new StandaloneTranslator({ translations }).init();
    expect(consoleError).toHaveBeenCalledWith("Unexpected value for 'lang' attribute: 'de'");
  });

  it('should translate a key into the resolved language', () => {
    document.documentElement.setAttribute('lang', 'fr');
    const translator = new StandaloneTranslator({ translations });
    translator.init();
    expect(translator.t('greetings.hello')).toBe('Bonjour');
  });

  it('should return a plain string value as is, whatever the language', () => {
    document.documentElement.setAttribute('lang', 'fr');
    const translator = new StandaloneTranslator({ translations });
    translator.init();
    expect(translator.t('untranslated')).toBe('Untranslated');
  });

  it('should use the fallback language when the resolved language has no translation', () => {
    document.documentElement.setAttribute('lang', 'fr');
    const translator = new StandaloneTranslator({ translations: partialTranslations });
    translator.init();
    expect(translator.t('onlyEnglish')).toBe('Only English');
  });

  it('should return the key itself when no translation exists in either language', () => {
    document.documentElement.setAttribute('lang', 'fr');
    const translator = new StandaloneTranslator({ fallbackLanguage: 'fr', translations: partialTranslations });
    translator.init();
    expect(translator.t('onlyEnglish')).toBe('onlyEnglish');
  });

  it('should return the key itself when it does not exist in the translations', () => {
    const translator = new StandaloneTranslator({ translations: partialTranslations });
    translator.init();
    expect(translator.t('missing.key')).toBe('missing.key');
  });

  it('should notify the init handler with the new language when the lang attribute changes', async () => {
    const onLanguageChange = vi.fn<(language: Language) => void>();
    new StandaloneTranslator({ translations }).init({ onLanguageChange });
    document.documentElement.setAttribute('lang', 'fr');
    await flushMutations();
    expect(onLanguageChange).toHaveBeenCalledExactlyOnceWith('fr');
  });

  it('should notify a handler assigned after init when the lang attribute changes', async () => {
    const onLanguageChange = vi.fn<(language: Language) => void>();
    const translator = new StandaloneTranslator({ translations });
    translator.init();
    translator.onLanguageChange = onLanguageChange;
    document.documentElement.setAttribute('lang', 'fr');
    await flushMutations();
    expect(onLanguageChange).toHaveBeenCalledExactlyOnceWith('fr');
  });

  it('should track a lang attribute change even when no handler is registered', async () => {
    const translator = new StandaloneTranslator({ translations });
    translator.init({ onLanguageChange: null });
    document.documentElement.setAttribute('lang', 'fr');
    await flushMutations();
    expect(translator.resolvedLanguage).toBe('fr');
  });

  it('should ignore changes to attributes other than lang', async () => {
    const onLanguageChange = vi.fn<(language: Language) => void>();
    new StandaloneTranslator({ translations }).init({ onLanguageChange });
    document.documentElement.setAttribute('dir', 'rtl');
    await flushMutations();
    expect(onLanguageChange).not.toHaveBeenCalled();
  });
});

describe('StandaloneTranslator', () => {
  it('should refuse to initialize outside of a browser', () => {
    const translator = new StandaloneTranslator({ translations });
    vi.stubGlobal('window', undefined);
    expect(() => translator.init()).toThrow('Cannot initialize StandaloneTranslator outside of browser');
  });

  it('should change the language by setting the lang attribute of the document', () => {
    const translator = new StandaloneTranslator({ translations });
    translator.init();
    translator.changeLanguage('fr');
    expect(document.documentElement.getAttribute('lang')).toBe('fr');
  });
});

describe('SynchronizedTranslator', () => {
  it('should refuse to initialize outside of a browser', () => {
    const translator = new SynchronizedTranslator({ translations });
    vi.stubGlobal('window', undefined);
    expect(() => translator.init()).toThrow('Cannot initialize SynchronizedTranslator outside of browser');
  });

  it('should refuse to initialize when the window is not inside a frame', () => {
    const translator = new SynchronizedTranslator({ translations });
    expect(() => translator.init()).toThrow(
      'Cannot initialize SynchronizedTranslator in context where window.frameElement is null'
    );
  });

  it('should refuse to initialize inside a frame other than the instrument renderer', () => {
    mountInstrumentFrame('other-frame');
    const translator = new SynchronizedTranslator({ translations });
    expect(() => translator.init()).toThrow('SynchronizedTranslator must be initialized in InstrumentRenderer');
  });

  it('should resolve the language from the lang attribute of the instrument frame', () => {
    const iframe = mountInstrumentFrame('interactive-instrument');
    iframe.setAttribute('lang', 'fr');
    const translator = new SynchronizedTranslator({ translations });
    translator.init();
    expect(translator.resolvedLanguage).toBe('fr');
  });

  it('should request a language change from the host by dispatching an event on the parent document', () => {
    mountInstrumentFrame('interactive-instrument');
    const dispatchEvent = vi.spyOn(window.parent.document, 'dispatchEvent');
    const translator = new SynchronizedTranslator({ translations });
    translator.init();
    translator.changeLanguage('fr');
    const event = dispatchEvent.mock.lastCall?.[0];
    expect(event?.type).toBe('changeLanguage');
    expect(event instanceof CustomEvent && event.detail).toBe('fr');
  });
});
