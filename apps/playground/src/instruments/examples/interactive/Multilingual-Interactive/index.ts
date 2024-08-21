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
  changeLanguage: {
    en: 'Change Language',
    fr: 'Changer de langue'
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

      const changeLanguageButton = document.createElement('button');
      changeLanguageButton.textContent = i18n.t('changeLanguage');
      document.body.appendChild(changeLanguageButton);

      changeLanguageButton.addEventListener('click', () => {
        console.log(i18n.resolvedLanguage);
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
  details: {
    description: '<PLACEHOLDER>',
    estimatedDuration: 1,
    instructions: ['<PLACEHOLDER>'],
    license: 'Apache-2.0',
    title: '<PLACEHOLDER>'
  },
  measures: {},
  validationSchema: z.object({
    message: z.string()
  })
});
