import { transformTranslations } from '@douglasneuroinformatics/ui';
import type { Language } from '@open-data-capture/common/core';
import _ from 'lodash';

import type { TranslatedResource, TranslationsDef } from './types';

function createResourcesForLanguage<T extends TranslationsDef>(translations: T, locale: Language) {
  return _.mapValues(translations, (value) => transformTranslations(value, locale));
}

export function createResources<T extends TranslationsDef>(translations: T) {
  return {
    en: createResourcesForLanguage(translations, 'en'),
    fr: createResourcesForLanguage(translations, 'fr')
  } as TranslatedResource<T>;
}
