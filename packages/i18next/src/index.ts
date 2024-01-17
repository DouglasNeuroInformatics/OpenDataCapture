import { i18n as i18nUi } from '@douglasneuroinformatics/ui';
import type { i18n } from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import Backend from 'i18next-http-backend';
import { initReactI18next } from 'react-i18next';

import { i18n as i18nCore } from './core';

export async function initI18next(i18n: i18n) {
  await i18n
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
}

export type { TranslatedResource } from './types';
