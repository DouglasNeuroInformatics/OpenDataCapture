/* eslint-disable @typescript-eslint/consistent-type-definitions */
/* eslint-disable @typescript-eslint/no-namespace */

import { i18n } from '@douglasneuroinformatics/libui/i18n';
import type { Language } from '@douglasneuroinformatics/libui/i18n';

declare module '@douglasneuroinformatics/libui/i18n' {
  export namespace UserConfig {
    export interface LanguageOptions {
      en: true;
      es: true;
      fr: true;
    }
  }
}

const VALID_LANGUAGES = ['en', 'es', 'fr'];

function detectLanguage(): Language {
  if (typeof window !== 'undefined') {
    const param = new URLSearchParams(window.location.search).get('lang');
    if (param && VALID_LANGUAGES.includes(param)) {
      return param as Language;
    }
  }
  return 'en';
}

i18n.init({
  defaultLanguage: detectLanguage(),
  translations: {}
});
