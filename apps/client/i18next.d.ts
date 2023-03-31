// import the original type declarations
import 'i18next';

// import all namespaces (for the default language, only)
import auth from './public/locales/en/auth.json';
import common from './public/locales/en/common.json';

declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: 'common';
    resources: {
      auth: typeof auth;
      common: typeof common;
    };
  }
}
