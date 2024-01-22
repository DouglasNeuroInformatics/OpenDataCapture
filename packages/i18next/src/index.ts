import { i18n as i18nUi } from '@douglasneuroinformatics/ui';
import { createInstance } from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { initReactI18next } from 'react-i18next';

import core from './translations/core.json';
import { createResources } from './utils';

import type { ExtendedI18NextInstance } from './types';

const defaultNS = 'core';

const resources = createResources({ core });

const createExtendedInstance = (): ExtendedI18NextInstance => {
  const baseInstance = createInstance({
    defaultNS,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    },
    resources,
    returnObjects: true,
    supportedLngs: ['en', 'fr']
  });
  return Object.assign(baseInstance, {
    async initialize(this: ExtendedI18NextInstance) {
      await this.use(LanguageDetector).use(initReactI18next).init();
      this.on('languageChanged', (lang) => {
        i18nUi.changeLanguage(lang).catch(console.error);
      });
    }
  });
};

export const i18n = createExtendedInstance();

export type DefaultNS = typeof defaultNS;

export type { TranslatedResource } from './types';
