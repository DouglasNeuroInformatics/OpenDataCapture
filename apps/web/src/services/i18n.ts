import { i18n } from '@opendatacapture/i18next';
import Backend from 'i18next-http-backend';

await i18n.use(Backend).init({
  ns: ['auth', 'common', 'contact', 'instruments', 'layout', 'overview', 'setup', 'subjects', 'user', 'visits'],
  partialBundledLanguages: true
});

export default i18n;
