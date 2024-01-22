import { i18n } from '@open-data-capture/i18next';
import Backend from 'i18next-http-backend';

i18n.use(Backend);

await i18n.loadNamespaces([
  'auth',
  'common',
  'contact',
  'instruments',
  'layout',
  'overview',
  'setup',
  'subjects',
  'user',
  'visits'
]);

await i18n.initialize();

export default i18n;
