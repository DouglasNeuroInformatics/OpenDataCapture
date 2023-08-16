import { translations } from './translations';
import type { Language } from '@ddcp/types';

type ExtractTranslationKey<T extends Record<string, any>, Key = keyof T> = Key extends string
  ? T[Key] extends Record<string, unknown>
    ? T[Key] extends Record<Language, string>
      ? Key
      : `${Key}.${ExtractTranslationKey<T[Key]>}`
    : `${Key}`
  : never;

type Translations = typeof translations;

type TranslationKey = ExtractTranslationKey<Translations>;

function getTranslation(path: TranslationKey, language: Language) {
  const value = path
    .split('.')
    .filter(Boolean)
    .reduce((accumulator, currentValue) => (accumulator as any)?.[currentValue], translations as any);
  return (value[language] ?? value) as string;
}

/** Return the locale parsed from the URL */
export function extractLanguageFromURL(url: URL) {
  const locale = url.pathname.split('/')[1];
  if (locale === 'fr') {
    return locale;
  }
  return 'en';
}

export function useTranslations(url: URL) {
  const resolvedLanguage = extractLanguageFromURL(url);
  const altLanguage = resolvedLanguage === 'en' ? 'fr' : 'en';
  const t = (path: TranslationKey) => {
    return getTranslation(path, resolvedLanguage);
  };
  return { altLanguage, resolvedLanguage, t };
}
