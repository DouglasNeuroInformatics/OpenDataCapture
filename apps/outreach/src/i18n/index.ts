import { get } from 'lodash-es';

import blog from './translations/blog.json';
import common from './translations/common.json';
import docs from './translations/docs.json';
import errors from './translations/errors.json';
import landing from './translations/landing.json';
import meta from './translations/meta.json';
import team from './translations/team.json';

const TRANSLATION_MODE_ATTRIBUTE = 'data-translation-mode';

type ExtractTranslationKey<T extends { [key: string]: unknown }, Key = keyof T> = Key extends string
  ? T[Key] extends { [key: string]: unknown }
    ? T[Key] extends { [K in Language]: string }
      ? Key
      : `${Key}.${ExtractTranslationKey<T[Key]>}`
    : `${Key}`
  : never;

const TRANSLATIONS = {
  blog,
  common,
  docs,
  errors,
  landing,
  meta,
  team
};

type Translations = typeof TRANSLATIONS;

type TranslationMode = 'client' | 'static';

type Language = 'en' | 'fr';

type TranslationKey = ExtractTranslationKey<Translations>;

type UseTranslations = (url: URL) => {
  readonly altLanguage: Language;
  readonly altURL: URL;
  readonly resolvedLanguage: Language;
  readonly t: (key: TranslationKey) => string;
  readonly translatePath: (path: string) => string;
};

type UseClientTranslations = () => {
  getTranslationMode: () => TranslationMode;
} & Pick<ReturnType<UseTranslations>, 't' | 'translatePath'>;

function getTranslation(key: TranslationKey, language: Language, translations: Translations) {
  const value = get(translations, key);
  if (typeof value === 'string') {
    return value;
  }
  return value[language];
}

function extractLanguageFromURL(url: Pick<URL, 'pathname'>) {
  const locale = url.pathname.split('/')[1];
  if (locale === 'fr') {
    return locale;
  }
  return 'en';
}

const useTranslations: UseTranslations = (url) => {
  const resolvedLanguage = extractLanguageFromURL(url);
  const altLanguage = resolvedLanguage === 'en' ? 'fr' : 'en';
  const altURL = new URL(url.href.replace(`/${resolvedLanguage}`, `/${altLanguage}`));
  const t = (key: TranslationKey) => {
    return getTranslation(key, resolvedLanguage, TRANSLATIONS);
  };
  const translatePath = (path: string) => {
    return `/${resolvedLanguage}${path}`;
  };
  return { altLanguage, altURL, resolvedLanguage, t, translatePath } as const;
};

const useClientTranslations: UseClientTranslations = () => {
  const resolvedLanguage = extractLanguageFromURL(window.location);
  const translations = window.__TRANSLATIONS__;
  if (!window.__TRANSLATIONS__) {
    console.error("Window missing expected property: '__TRANSLATIONS__'");
  }
  return {
    getTranslationMode: () => {
      return document.documentElement.getAttribute(TRANSLATION_MODE_ATTRIBUTE) as TranslationMode;
    },
    t: (key) => {
      if (!translations) {
        return '';
      }
      return getTranslation(key, resolvedLanguage, translations) ?? '';
    },
    translatePath: (path: string) => `/${resolvedLanguage}${path}`
  };
};

export { TRANSLATIONS, useClientTranslations, useTranslations };
export type { Language, TranslationKey, TranslationMode, Translations };
