import React from 'react';

import { Heading } from '@douglasneuroinformatics/libui/components';
import { useTranslation } from 'react-i18next';

import { LoadingFallback } from '@/components/LoadingFallback';
import { PageHeader } from '@/components/PageHeader';

import { InstrumentsShowcase } from '../components/InstrumentShowcase';

export const AccessibleInstrumentsPage = () => {
  const { t } = useTranslation(['core', 'instruments']);
  return (
    <React.Fragment>
      <PageHeader>
        <Heading className="text-center" variant="h2">
          {t('instruments:accessible.title')}
        </Heading>
      </PageHeader>
      <React.Suspense fallback={<LoadingFallback />}>
        <InstrumentsShowcase />
      </React.Suspense>
    </React.Fragment>
  );
};
