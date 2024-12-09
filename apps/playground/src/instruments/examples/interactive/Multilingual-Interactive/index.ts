/* eslint-disable perfectionist/sort-objects */

import { createI18Next, defineInstrument } from '/runtime/v1/@opendatacapture/runtime-core';
import { z } from '/runtime/v1/zod@3.23.x';

import { translations } from './translations.ts';

export default defineInstrument({
  kind: 'INTERACTIVE',
  language: ['en', 'fr'],
  tags: {
    en: ['<PLACEHOLDER>'],
    fr: ['<PLACEHOLDER>']
  },
  internal: {
    edition: 1,
    name: '<PLACEHOLDER>'
  },
  content: {
    render(done) {
      const i18n = createI18Next({ translations });

      const changeLanguageButton = document.createElement('button');
      changeLanguageButton.textContent = i18n.t('changeLanguage');
      document.body.appendChild(changeLanguageButton);

      changeLanguageButton.addEventListener('click', () => {
        i18n.changeLanguage(i18n.resolvedLanguage === 'en' ? 'fr' : 'en');
      });

      const submitButton = document.createElement('button');
      submitButton.textContent = i18n.t('submit');
      document.body.appendChild(submitButton);

      i18n.onLanguageChange = () => {
        changeLanguageButton.textContent = i18n.t('changeLanguage');
        submitButton.textContent = i18n.t('submit');
      };

      submitButton.addEventListener('click', () => {
        done({ message: i18n.t('greetings.hello') });
      });
    }
  },
  clientDetails: {
    estimatedDuration: 1,
    instructions: {
      en: ['<PLACEHOLDER>'],
      fr: ['<PLACEHOLDER>']
    }
  },
  details: {
    description: {
      en: '<PLACEHOLDER>',
      fr: '<PLACEHOLDER>'
    },
    license: 'UNLICENSED',
    title: {
      en: '<PLACEHOLDER>',
      fr: '<PLACEHOLDER>'
    }
  },
  measures: {},
  validationSchema: z.object({
    message: z.string()
  })
});
