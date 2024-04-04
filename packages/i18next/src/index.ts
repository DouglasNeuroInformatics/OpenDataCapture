import { i18n } from '@douglasneuroinformatics/libui/i18n';

import core from './translations/core.json';

const defaultNS = 'core';

i18n.setDefaultNamespace('core');
i18n.addPreInitTranslations({ core });

export { defaultNS, i18n };
