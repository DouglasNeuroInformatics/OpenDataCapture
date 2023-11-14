import { i18n as i18nUi } from '@douglasneuroinformatics/ui';
import { default as i18nCore } from '@open-data-capture/react-core/services/i18n';
import i18n from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import Backend from 'i18next-http-backend';
import { initReactI18next } from 'react-i18next';

void i18n
  .use(Backend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    debug: false,
    defaultNS: 'common',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    },
    ns: ['auth', 'common', 'contact', 'instruments', 'layout', 'overview', 'setup', 'subjects', 'user', 'visits'],
    returnObjects: true,
    supportedLngs: ['en', 'fr']
  });

i18n.on('languageChanged', (lang) => {
  i18nCore.changeLanguage(lang).catch(console.error);
  i18nUi.changeLanguage(lang).catch(console.error);
});

export default i18n;
