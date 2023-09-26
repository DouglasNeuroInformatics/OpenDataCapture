import type { Language } from '@open-data-capture/types';

type MultilingualOptions = Record<string, {
    [L in Language]: string;
  }>;

type TranslatedOptions<T extends MultilingualOptions> = {
  [K in keyof T]: string;
};

type FormattedOptions<T extends MultilingualOptions> = {
  [L in Language]: {
    [K in keyof T]: string;
  };
};

/** Transform multilingual options as stored in src/data to options for a specific language */
function getTranslatedOptions<T extends MultilingualOptions>(options: T, language: Language): TranslatedOptions<T> {
  const translatedOptions: Partial<TranslatedOptions<T>> = {};
  for (const option in options) {
    translatedOptions[option] = options[option]?.[language];
  }
  return translatedOptions as TranslatedOptions<T>;
}

/** Transform multilingual options as stored in src/data to options for a multilingual instrument */
export function formatOptions<T extends MultilingualOptions>(options: T): FormattedOptions<T> {
  return {
    en: getTranslatedOptions(options, 'en'),
    fr: getTranslatedOptions(options, 'fr')
  };
}

export function extractKeys<T extends MultilingualOptions>(options: T, nullable = false) {
  const keys = Object.keys(options) as (keyof T)[];
  return nullable ? [...keys, null] : keys;
}

export type { MultilingualOptions };
