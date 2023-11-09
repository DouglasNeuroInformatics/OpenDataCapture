import { createInstance } from 'i18next';
import { initReactI18next } from 'react-i18next';

const defaultNS = 'translations';

const resources = {
  en: {
    translations: {}
  },
  fr: {
    translations: {}
  }
} as const;

const i18n = createInstance({
  defaultNS,
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false
  },
  resources,
  returnObjects: true,
  supportedLngs: ['en', 'fr']
});

void i18n.use(initReactI18next).init();

export { defaultNS, i18n as default, resources };
