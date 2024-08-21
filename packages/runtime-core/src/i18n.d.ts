import type { Language } from './types/core.d.ts';

/** @alpha */
declare type LanguageChangeHandler = (this: void, language: Language) => void;

/** @alpha */
declare type TranslationKey<T extends { [key: string]: unknown }, Key = keyof T> = Key extends string
  ? T[Key] extends { [key: string]: unknown }
    ? T[Key] extends { [K in Language]: string }
      ? Key
      : `${Key}.${TranslationKey<T[Key]>}`
    : `${Key}`
  : never;

/** @alpha */
declare type I18N<T extends { [key: string]: unknown }> = {
  readonly resolvedLanguage: Language;
  set onLanguageChange(value: LanguageChangeHandler);
  readonly t: (key: TranslationKey<T>) => string;
};

/** @alpha */
export declare function createI18Next<const T extends { [key: string]: unknown }>(options?: {
  fallbackLanguage?: Language;
  translations?: T;
}): I18N<T>;
