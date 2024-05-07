import { i18n } from '@opendatacapture/i18next';

import auth from '../translations/auth.json';
import common from '../translations/common.json';
import contact from '../translations/contact.json';
import dashboard from '../translations/dashboard.json';
import group from '../translations/group.json';
import instruments from '../translations/instruments.json';
import layout from '../translations/layout.json';
import session from '../translations/session.json';
import setup from '../translations/setup.json';
import subjects from '../translations/subjects.json';
import user from '../translations/user.json';

i18n.addPreInitTranslations({
  auth,
  common,
  contact,
  dashboard,
  group,
  instruments,
  layout,
  session,
  setup,
  subjects,
  user
});

await i18n.init();

export default i18n;
