import React from 'react';

import { Heading } from '@douglasneuroinformatics/libui/components';
import { useTranslation } from 'react-i18next';

import { LoadingFallback } from '@/components/LoadingFallback';
import { PageHeader } from '@/components/PageHeader';

import { InstrumentsShowcase } from '../components/InstrumentShowcase';

export const AvailableInstrumentsPage = () => {
  const { t } = useTranslation(['core', 'instruments']);
  return (
    <React.Fragment>
      <PageHeader>
        <Heading variant="h2">{t('instruments:available.title')}</Heading>
      </PageHeader>
      <React.Suspense fallback={<LoadingFallback />}>
        <InstrumentsShowcase />
      </React.Suspense>
    </React.Fragment>
  );
};
