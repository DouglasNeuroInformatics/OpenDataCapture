// import the original type declarations
import 'i18next';

// import all namespaces (for the default language, only)
import auth from './public/locales/en/auth.json';
import common from './public/locales/en/common.json';
import datetime from './public/locales/en/datetime.json';
import form from './public/locales/en/form.json';
import instruments from './public/locales/en/instruments.json';
import overview from './public/locales/en/overview.json';
import subjects from './public/locales/en/subjects.json';

declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: 'common';
    resources: {
      auth: typeof auth;
      common: typeof common;
      datetime: typeof datetime;
      form: typeof form;
      instruments: typeof instruments;
      overview: typeof overview;
      subjects: typeof subjects;
    };
  }
}
