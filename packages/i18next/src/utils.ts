import type { Language } from '@opendatacapture/schemas/core';
import _ from 'lodash';

import type { TranslatedResource, TranslationsDef } from './types.js';

function transformTranslations<T extends { [key: string]: any }>(translations: T, locale: string) {
  const isPlainObject = Object.getPrototypeOf(translations) === Object.prototype;
  if (!isPlainObject) {
    throw new Error('Invalid format of translations: must be plain object');
  }
  const result: { [key: string]: unknown } = {};
  for (const key in translations) {
    const value = translations[key];
    if (Object.hasOwn(value, locale)) {
      result[key] = value[locale as keyof typeof value];
    } else {
      result[key] = transformTranslations(value, locale);
    }
  }
  return result;
}

function createResourcesForLanguage<T extends TranslationsDef>(translations: T, locale: Language) {
  return _.mapValues(translations, (value) => transformTranslations(value, locale));
}

function createResources<T extends TranslationsDef>(translations: T) {
  return {
    en: createResourcesForLanguage(translations, 'en'),
    fr: createResourcesForLanguage(translations, 'fr')
  } as TranslatedResource<T>;
}

export { createResources, transformTranslations };
