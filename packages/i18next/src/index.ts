import { i18n as i18nUi } from '@douglasneuroinformatics/ui';
import type { Language } from '@open-data-capture/common/core';
import { type InitOptions, createInstance } from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import _ from 'lodash';
import { initReactI18next } from 'react-i18next';

import core from './translations/core.json';
import { createResources } from './utils.js';

import type { ExtendedI18NextInstance } from './types.js';

const defaultNS = 'core';

const resources = createResources({ core });

export const createExtendedInstance = (
  options: Omit<InitOptions, 'defaultNS' | 'supportedLngs'> = {}
): ExtendedI18NextInstance => {
  const baseInstance = createInstance(
    _.merge(
      {
        defaultNS,
        fallbackLng: 'en',
        interpolation: {
          escapeValue: false
        },
        partialBundledLanguages: true,
        resources,
        returnObjects: true,
        supportedLngs: ['en', 'fr']
      },
      options
    )
  );
  return Object.assign(baseInstance as typeof baseInstance & { resolvedLanguage: Language }, {
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

export type { TranslatedResource } from './types.js';
