import { i18n } from '@douglasneuroinformatics/libui/i18n';

import core from './translations/core.json';

i18n.setDefaultNamespace('core');
i18n.addPreInitTranslations({ core });

export { i18n };
