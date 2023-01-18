// import the original type declarations
import 'i18next';

// import all namespaces (for the default language, only)
import translation from './public/locales/en/translation.json';

declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: 'common';
    resources: {
      translation: typeof translation;
    };
  }
}
