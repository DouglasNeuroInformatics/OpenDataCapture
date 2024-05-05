import React from 'react';

import { useTranslation } from 'react-i18next';
import { Navigate } from 'react-router-dom';

import { PageHeader } from '@/components/PageHeader';
import { useAppStore } from '@/store';

import { Disclaimer } from '../components/Disclaimer';
import { GroupSwitcher } from '../components/GroupSwitcher';
import { Summary } from '../components/Summary';

export const OverviewPage = () => {
  const currentUser = useAppStore((store) => store.currentUser);
  const { t } = useTranslation('overview');

  const pageTitle = currentUser?.firstName ? `${t('welcome')}, ${currentUser.firstName}` : t('welcome');

  if (!currentUser?.ability.can('read', 'Summary')) {
    return <Navigate to="/session/start-session" />;
  }

  return (
    <div className="flex flex-grow flex-col">
      <Disclaimer isRequired={import.meta.env.PROD} />
      <PageHeader title={pageTitle} />
      <section className="flex flex-grow flex-col">
        <div className="mb-5 space-y-5 lg:space-y-2">
          <h3 className="text-center text-xl font-medium lg:text-left">{t('summary')}</h3>
          <GroupSwitcher />
        </div>
        <Summary />
      </section>
    </div>
  );
};
