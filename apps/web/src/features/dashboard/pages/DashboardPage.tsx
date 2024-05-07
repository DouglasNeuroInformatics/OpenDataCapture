import React from 'react';

import { Heading } from '@douglasneuroinformatics/libui/components';
import { useTranslation } from 'react-i18next';
import { Navigate } from 'react-router-dom';

import { PageHeader } from '@/components/PageHeader';
import { useAppStore } from '@/store';

import { Disclaimer } from '../components/Disclaimer';
import { GroupSwitcher } from '../components/GroupSwitcher';
import { Summary } from '../components/Summary';

export const DashboardPage = () => {
  const currentGroup = useAppStore((store) => store.currentGroup);
  const currentUser = useAppStore((store) => store.currentUser);
  const { t } = useTranslation('dashboard');

  if (!currentUser?.ability.can('read', 'Summary')) {
    return <Navigate to="/session/start-session" />;
  }

  return (
    <div className="flex flex-grow flex-col">
      <Disclaimer isRequired={import.meta.env.PROD} />
      <PageHeader className="text-center">
        <Heading variant="h2">{t('pageTitle')}</Heading>
      </PageHeader>
      <section className="flex flex-grow flex-col">
        <div className="mb-5 flex w-full items-center justify-between space-y-5 lg:space-y-2">
          <Heading variant="h3">{t('welcome', { context: currentGroup?.type })}</Heading>
          <GroupSwitcher />
        </div>
        <Summary />
      </section>
    </div>
  );
};
