import { get } from 'lodash-es';

import blog from './translations/blog.json';
import common from './translations/common.json';
import docs from './translations/docs.json';
import landing from './translations/landing.json';
import meta from './translations/meta.json';
import team from './translations/team.json';

const translations = {
  blog,
  common,
  docs,
  landing,
  meta,
  team
};

type Language = 'en' | 'fr';

type ExtractTranslationKey<T extends { [key: string]: unknown }, Key = keyof T> = Key extends string
  ? T[Key] extends { [key: string]: unknown }
    ? T[Key] extends { [K in Language]: string }
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
  value;
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

export type { Language };
