import { i18n as i18nUi } from '@douglasneuroinformatics/ui';
import { createInstance } from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { initReactI18next } from 'react-i18next';

import core from './translations/core.json';
import { createResources } from './utils';

export const defaultNS = 'core';

const resources = createResources({ core });

export const i18next = {
  i18n: createInstance({
    defaultNS,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    },
    resources,
    returnObjects: true,
    supportedLngs: ['en', 'fr']
  }),
  async init() {
    await this.i18n.use(LanguageDetector).use(initReactI18next).init();
    this.i18n.on('languageChanged', (lang) => {
      i18nUi.changeLanguage(lang).catch(console.error);
    });
  }
};

export type { TranslatedResource } from './types';
