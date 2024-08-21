import { get } from 'lodash-es';

import type { Language } from './types/core.d.ts';

type LanguageChangeHandler = (this: void, language: Language) => void;

type TranslationKey<T extends { [key: string]: unknown }, Key = keyof T> = Key extends string
  ? T[Key] extends { [key: string]: unknown }
    ? T[Key] extends { [K in Language]: string }
      ? Key
      : `${Key}.${TranslationKey<T[Key]>}`
    : `${Key}`
  : never;

type I18N<T extends { [key: string]: unknown }> = {
  readonly resolvedLanguage: Language;
  set onLanguageChange(value: LanguageChangeHandler);
  readonly t: (key: TranslationKey<T>) => string;
};

export function createInstance<const T extends { [key: string]: unknown }>({
  fallbackLanguage = 'en',
  translations
}: {
  fallbackLanguage?: Language;
  translations?: T;
} = {}): I18N<T> {
  let resolvedLanguage: Language;
  let handleLanguageChange: LanguageChangeHandler | null = null;

  const documentElement = window.top!.document.documentElement;
  const extractLanguageProperty = (element: HTMLElement): Language => {
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
    set onLanguageChange(handler: LanguageChangeHandler) {
      handleLanguageChange = handler;
    },
    resolvedLanguage,
    t: (key) => {
      const value = get(translations, key) as { [K in Language]?: string } | string;
      if (typeof value === 'string') {
        return value;
      }
      return value[resolvedLanguage] ?? value[fallbackLanguage] ?? key;
    }
  };
}
