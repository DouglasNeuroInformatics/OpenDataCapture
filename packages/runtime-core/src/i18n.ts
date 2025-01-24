import { get } from 'lodash-es';

import type { Language } from './types/core.js';

/** @alpha */
export type LanguageChangeHandler = (this: void, language: Language) => void;

/** @alpha */
export type TranslationKey<T extends { [key: string]: unknown }, Key = keyof T> = Key extends string
  ? T[Key] extends { [key: string]: unknown }
    ? T[Key] extends { [K in Language]: string }
      ? Key
      : `${Key}.${TranslationKey<T[Key]>}`
    : `${Key}`
  : never;

/** @alpha */
export type I18N<T extends { [key: string]: unknown }> = {
  changeLanguage: (language: Language) => void;
  readonly resolvedLanguage: Language;
  set onLanguageChange(value: LanguageChangeHandler);
  readonly t: (key: TranslationKey<T>) => string;
};

/** @alpha */
export function createI18Next<const T extends { [key: string]: unknown }>({
  fallbackLanguage = 'en',
  translations
}: {
  fallbackLanguage?: Language;
  translations?: T;
} = {}): I18N<T> {
  let resolvedLanguage: Language;
  let handleLanguageChange: LanguageChangeHandler | null = null;

  if (!window) {
    throw new Error('Window is not defined');
  }

  const documentElement = window.top!.document.documentElement;
  const extractLanguageProperty = (element: HTMLElement) => {
    if (element.lang === 'en' || element.lang === 'fr') {
      return element.lang;
    }
    console.error(`Unexpected value for HTMLElement 'lang' attribute: '${element.lang}'`);
    return fallbackLanguage;
  };

  const languageAttributeObserver = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.attributeName === 'lang') {
        resolvedLanguage = extractLanguageProperty(mutation.target as HTMLElement);
        handleLanguageChange?.(resolvedLanguage);
        handleLanguageChange?.(resolvedLanguage);
      }
    });
  });

  resolvedLanguage = extractLanguageProperty(documentElement);
  languageAttributeObserver.observe(documentElement, { attributes: true });

  return {
    changeLanguage: (language) => {
      window.top!.document.dispatchEvent(new CustomEvent('changeLanguage', { detail: language }));
    },
    set onLanguageChange(handler: LanguageChangeHandler) {
      handleLanguageChange = handler;
    },
    get resolvedLanguage() {
      return resolvedLanguage;
    },
    t: (key) => {
      const value = get(translations, key) as { [key: string]: string } | string | undefined;
      if (typeof value === 'string') {
        return value;
      }
      return value?.[resolvedLanguage] ?? value?.[fallbackLanguage] ?? key;
    }
  };
}
