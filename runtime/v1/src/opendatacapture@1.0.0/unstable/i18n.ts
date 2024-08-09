import type { Language } from '@opendatacapture/schemas/core';

const documentElement = window.top!.document.documentElement;
const fallbackLanguage: Language = 'en';

type LanguageChangeHandler = (this: void, language: Language) => void;

function extractLanguageProperty(element: HTMLElement): Language {
  if (element.lang === 'en' || element.lang === 'fr') {
    return element.lang;
  }
  console.error(`Unexpected value for HTMLElement 'lang' attribute: '${element.lang}'`);
  return fallbackLanguage;
}

class I18N {
  #handleLanguageChange: LanguageChangeHandler | null;
  #isInitialized: boolean;
  #languageAttributeObserver: MutationObserver;
  #resolvedLanguage: Language | null;

  constructor() {
    this.#isInitialized = false;
    this.#handleLanguageChange = null;
    this.#resolvedLanguage = null;
    this.#languageAttributeObserver = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'lang') {
          this.#resolvedLanguage = extractLanguageProperty(mutation.target as HTMLElement);
          this.#handleLanguageChange?.(this.resolvedLanguage);
        }
      });
    });
  }

  get resolvedLanguage() {
    if (!this.#isInitialized) {
      throw new Error('Cannot access property before init method is called');
    }
    return this.#resolvedLanguage!;
  }

  init() {
    this.#isInitialized = true;
    this.#resolvedLanguage = extractLanguageProperty(documentElement);
    this.#languageAttributeObserver.observe(documentElement, { attributes: true });
  }

  onLanguageChange(handler: LanguageChangeHandler) {
    if (!this.#isInitialized) {
      throw new Error('Cannot register handler before init method is called');
    }
    this.#handleLanguageChange = handler;
  }
}

export const i18n = new I18N();
