import React from 'react';

import { useTranslation } from 'react-i18next';

import { LoadingFallback } from '@/components/LoadingFallback';
import { PageHeader } from '@/components/PageHeader';

import { SubjectsTable } from '../components/SubjectsTable';

export const SubjectIndexPage = () => {
  const { t } = useTranslation('subjects');

  return (
    <React.Fragment>
      <PageHeader title={t('index.title')} />
      <React.Suspense fallback={<LoadingFallback />}>
        <SubjectsTable />
      </React.Suspense>
    </React.Fragment>
  );
};
