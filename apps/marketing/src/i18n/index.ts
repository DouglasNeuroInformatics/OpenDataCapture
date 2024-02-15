import type { Language } from '@open-data-capture/common/core';
import { get } from 'lodash-es';

import common from './translations/common.json';
import docs from './translations/docs.json';
import meta from './translations/meta.json';

const translations = {
  common,
  docs,
  meta
};

type ExtractTranslationKey<T extends Record<string, unknown>, Key = keyof T> = Key extends string
  ? T[Key] extends Record<string, unknown>
    ? T[Key] extends Record<Language, string>
      ? Key
      : `${Key}.${ExtractTranslationKey<T[Key]>}`
    : `${Key}`
  : never;

type Translations = typeof translations;

type TranslationKey = ExtractTranslationKey<Translations>;

function getTranslation(key: TranslationKey, language: Language) {
  const value = get(translations, key);
  if (typeof value === 'string') {
    return value;
  }
  return value[language];
}

function extractLanguageFromURL(url: URL) {
  const locale = url.pathname.split('/')[1];
  if (locale === 'fr') {
    return locale;
  }
  return 'en';
}

export function useTranslations(url: URL) {
  const resolvedLanguage = extractLanguageFromURL(url);
  const altLanguage = resolvedLanguage === 'en' ? 'fr' : 'en';
  const altURL = new URL(url.href.replace(`/${resolvedLanguage}`, `/${altLanguage}`));
  const t = (key: TranslationKey) => {
    return getTranslation(key, resolvedLanguage);
  };
  const translatePath = (path: string) => {
    return `/${resolvedLanguage}${path}`;
  };
  return { altLanguage, altURL, resolvedLanguage, t, translatePath } as const;
}
