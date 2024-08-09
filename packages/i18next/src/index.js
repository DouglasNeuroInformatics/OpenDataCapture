import { i18n } from '@douglasneuroinformatics/libui/i18n';

import core from './translations/core.json';

i18n.setDefaultNamespace('core');
i18n.addPreInitTranslations({ core });

i18n.on('languageChanged', (lang) => {
  if (typeof window !== 'undefined') {
    document.documentElement.lang = lang;
  }
});

export { i18n };
