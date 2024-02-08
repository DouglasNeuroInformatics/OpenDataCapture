import { useTranslation } from 'react-i18next';

import { PageHeader } from '@/components/PageHeader';
import { useAuthStore } from '@/stores/auth-store';

import { Disclaimer } from '../components/Disclaimer';
import { GroupSwitcher } from '../components/GroupSwitcher';
import { Summary } from '../components/Summary';

export const OverviewPage = () => {
  const { currentUser } = useAuthStore();
  const { t } = useTranslation('overview');

  const pageTitle = currentUser?.firstName ? `${t('welcome')}, ${currentUser.firstName}` : t('welcome');

  return (
    <div>
      <Disclaimer isRequired={import.meta.env.PROD} />
      <PageHeader title={pageTitle} />
      <section>
        <div className="mb-5 space-y-5 lg:space-y-2">
          <h3 className="text-center text-xl font-medium lg:text-left">{t('summary')}</h3>
          <GroupSwitcher />
        </div>
        {currentUser?.ability.can('read', 'Summary') && <Summary />}
      </section>
    </div>
  );
};
