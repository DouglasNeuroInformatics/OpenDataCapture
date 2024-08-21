/* eslint-disable perfectionist/sort-objects */

const { defineInstrument, createI18Next } = await import('/runtime/v1/@opendatacapture/runtime-core/index.js');
const { z } = await import('/runtime/v1/zod@3.23.6/index.js');

const translations = {
  greetings: {
    hello: {
      en: 'Hello',
      fr: 'Bonjour'
    }
  },
  submit: {
    en: 'Submit',
    fr: 'Soumettre'
  }
};

export default defineInstrument({
  kind: 'INTERACTIVE',
  language: 'en',
  tags: ['<PLACEHOLDER>'],
  internal: {
    edition: 1,
    name: '<PLACEHOLDER>'
  },
  content: {
    render(done) {
      const i18n = createI18Next({ translations });
      const button = document.createElement('button');

      button.textContent = i18n.t('submit');
      document.body.appendChild(button);

      i18n.onLanguageChange = () => {
        button.textContent = i18n.t('submit');
      };

      button.addEventListener('click', () => {
        done({ message: i18n.t('greetings.hello') });
      });
    }
  },
  details: {
    description: '<PLACEHOLDER>',
    estimatedDuration: 1,
    instructions: ['<PLACEHOLDER>'],
    license: 'UNLICENSED',
    title: '<PLACEHOLDER>'
  },
  measures: {},
  validationSchema: z.object({
    message: z.string()
  })
});
