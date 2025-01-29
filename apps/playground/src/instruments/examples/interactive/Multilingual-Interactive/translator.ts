import { Translator } from '/runtime/v1/@opendatacapture/runtime-core';

export const translator = new Translator({
  translations: {
    changeLanguage: {
      en: 'Change Language',
      fr: 'Changer de langue'
    },
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
  }
});
