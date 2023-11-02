import type { Language } from '../core/core.types';
import type { BaseInstrument } from './instrument.types';

type MultilingualOptions = Record<
  string,
  {
    [L in Language]: string;
  }
>;

type TranslatedOptions<T extends MultilingualOptions> = {
  [K in keyof T]: string;
};

type FormattedOptions<T extends MultilingualOptions> = {
  [L in Language]: {
    [K in keyof T]: string;
  };
};

function translateOptions<T extends MultilingualOptions>(options: T, language: Language): TranslatedOptions<T> {
  const translatedOptions: Partial<TranslatedOptions<T>> = {};
  for (const option in options) {
    translatedOptions[option] = options[option]?.[language];
  }
  return translatedOptions as TranslatedOptions<T>;
}

/** Transform multilingual options to options for a multilingual instrument */
export function formatTranslatedOptions<T extends MultilingualOptions>(options: T): FormattedOptions<T> {
  return {
    en: translateOptions(options, 'en'),
    fr: translateOptions(options, 'fr')
  };
}

export function extractKeysAsTuple<T extends Record<string, unknown>>(options: T) {
  return Object.keys(options) as [keyof T, ...(keyof T)[]];
}

export function evaluateInstrument<T extends BaseInstrument>(source: string) {
  return (0, eval)(`"use strict"; ${source}`) as T;
}
