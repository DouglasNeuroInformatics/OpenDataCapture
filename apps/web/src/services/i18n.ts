import { createExtendedInstance } from '@opendatacapture/i18next';
import Backend from 'i18next-http-backend';

const i18n = createExtendedInstance({
  ns: ['auth', 'common', 'contact', 'instruments', 'layout', 'overview', 'setup', 'subjects', 'user', 'visits']
});

i18n.use(Backend);

await i18n.initialize();

export default i18n;
