/* eslint-disable perfectionist/sort-objects */

import { createInstrumentStub } from './utils.js';

/** @type {import('./utils.js').InstrumentStub<import('@opendatacapture/runtime-core').InteractiveInstrument<{ message: string }>>} */
export const interactiveInstrument = await createInstrumentStub(async () => {
  const { z } = await import('zod/v4');
  return {
    __runtimeVersion: 1,
    kind: 'INTERACTIVE',
    language: 'en',
    tags: ['Example', 'Useless'],
    internal: {
      edition: 1,
      name: 'INTERACTIVE_INSTRUMENT'
    },
    content: {
      render(done) {
        document.body.style.display = 'flex';
        document.body.style.flexDirection = 'column';
        document.body.style.placeContent = 'center';
        document.body.style.height = '100vh';
        document.body.style.width = '100vw';
        document.body.style.padding = '0px';
        document.body.style.margin = '0px';

        const button = document.createElement('button');
        button.style.margin = 'auto';
        button.textContent = 'Submit Instrument';

        document.body.appendChild(button);
        button.addEventListener('click', () => {
          done({ message: 'Hello World' });
        });
      }
    },
    details: {
      description: 'This is an interactive instrument',
      estimatedDuration: 1,
      instructions: [],
      license: 'UNLICENSED',
      title: 'Interactive Instrument'
    },
    measures: {},
    validationSchema: z.object({
      message: z.string()
    })
  };
});

/** @type {import('./utils.js').InstrumentStub<import('@opendatacapture/runtime-core').InteractiveInstrument<{ message: string }>>} */
export const bilingualInteractiveInstrument = await createInstrumentStub(async () => {
  const { z } = await import('zod/v4');
  const { Translator } = await import('@opendatacapture/runtime-core');

  const translator = new Translator({
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

  return {
    __runtimeVersion: 1,
    kind: 'INTERACTIVE',
    language: ['en', 'fr'],
    tags: ['Example', 'Useless'],
    internal: {
      edition: 1,
      name: 'BILINGUAL_INTERACTIVE_INSTRUMENT'
    },
    content: {
      enableLanguageSelect: true,
      enableLanguageToggle: true,
      render(done) {
        translator.init();

        const changeLanguageButton = document.createElement('button');
        changeLanguageButton.textContent = translator.t('changeLanguage');
        document.body.appendChild(changeLanguageButton);

        changeLanguageButton.addEventListener('click', () => {
          translator.changeLanguage(translator.resolvedLanguage === 'en' ? 'fr' : 'en');
        });

        const submitButton = document.createElement('button');
        submitButton.textContent = translator.t('submit');
        document.body.appendChild(submitButton);

        translator.onLanguageChange = () => {
          changeLanguageButton.textContent = translator.t('changeLanguage');
          submitButton.textContent = translator.t('submit');
        };

        submitButton.addEventListener('click', () => {
          done({ message: translator.t('greetings.hello') });
        });
      }
    },
    details: {
      description: {
        en: 'This is an interactive instrument',
        fr: "Il s'agit d'un instrument interactif"
      },
      estimatedDuration: 1,
      instructions: [],
      license: 'UNLICENSED',
      title: {
        en: 'Interactive Instrument',
        fr: 'Instrument interactif'
      }
    },
    measures: {},
    validationSchema: z.object({
      message: z.string()
    })
  };
});
