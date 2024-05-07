import { i18n } from '@opendatacapture/i18next';

import auth from '../translations/auth.json';
import common from '../translations/common.json';
import contact from '../translations/contact.json';
import dashboard from '../translations/dashboard.json';
import datahub from '../translations/datahub.json';
import group from '../translations/group.json';
import instruments from '../translations/instruments.json';
import layout from '../translations/layout.json';
import session from '../translations/session.json';
import setup from '../translations/setup.json';
import user from '../translations/user.json';

i18n.addPreInitTranslations({
  auth,
  common,
  contact,
  dashboard,
  datahub,
  group,
  instruments,
  layout,
  session,
  setup,
  user
});

await i18n.init();

export default i18n;
