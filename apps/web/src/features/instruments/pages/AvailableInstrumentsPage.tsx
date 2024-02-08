import React from 'react';

import { useTranslation } from 'react-i18next';

import { LoadingFallback } from '@/components/LoadingFallback';
import { PageHeader } from '@/components/PageHeader';

import { InstrumentsShowcase } from '../components/InstrumentShowcase';

export const AvailableInstrumentsPage = () => {
  const { t } = useTranslation(['core', 'instruments']);
  return (
    <React.Fragment>
      <PageHeader title={t('instruments:available.title')} />
      <React.Suspense fallback={<LoadingFallback />}>
        <InstrumentsShowcase />
      </React.Suspense>
    </React.Fragment>
  );
};
