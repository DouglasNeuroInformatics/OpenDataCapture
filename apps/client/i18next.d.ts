// import the original type declarations
import 'i18next';

// import all namespaces (for the default language, only)
import common from './public/locales/en/common.json';
import contact from './public/locales/en/contact.json';
import instruments from './public/locales/en/instruments.json';
import overview from './public/locales/en/overview.json';
import subjects from './public/locales/en/subjects.json';

declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: 'common';
    resources: {
      common: typeof common;
      contact: typeof contact;
      instruments: typeof instruments;
      overview: typeof overview;
      subjects: typeof subjects;
    };
  }
}
