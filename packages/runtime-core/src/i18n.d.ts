import type { Language } from './types/core.d.ts';

/** @alpha */
type LanguageChangeHandler = (this: void, language: Language) => void;

/** @alpha */
export declare const i18n: {
  get resolvedLanguage(): Language;
  init(): void;
  onLanguageChange(handler: LanguageChangeHandler): void;
};
