import React from 'react';

import { useTranslation } from 'react-i18next';

import { PageHeader } from '@/components/PageHeader';

import { ManageGroupForm } from '../components/ManageGroupForm';

export const ManageGroupPage = () => {
  const { t } = useTranslation('group');
  return (
    <React.Fragment>
      <PageHeader title={t('manage.pageTitle')} />
      <ManageGroupForm onSubmit={() => null} />
    </React.Fragment>
  );
};
