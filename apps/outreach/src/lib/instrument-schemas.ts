import type { InstrumentLanguage } from '@opendatacapture/runtime-core';
import { capitalize } from 'lodash-es';

const LANGUAGE_NAMES = {
  en: 'English',
  fr: 'French'
};

const SCHEMA_KINDS = ['form', 'interactive', 'series', 'any'] as const;

const SCHEMA_LANGUAGES = ['en', 'fr', ['en', 'fr']] as const satisfies InstrumentLanguage[];

export function getSchemaProps() {
  return SCHEMA_KINDS.flatMap((kind) => {
    return SCHEMA_LANGUAGES.map((language) => {
      let displayLanguage: string;
      if (typeof language === 'string') {
        displayLanguage = LANGUAGE_NAMES[language];
      } else {
        displayLanguage = language.map((language) => LANGUAGE_NAMES[language]).join('/');
      }
      return {
        meta: {
          displayName: `${capitalize(kind)} Instrument (${displayLanguage})`,
          language: language
        },
        params: {
          kind,
          lang: Array.isArray(language) ? language.join('-') : language
        }
      };
    });
  });
}
