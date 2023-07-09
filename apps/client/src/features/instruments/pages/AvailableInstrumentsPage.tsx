import React from 'react';

import { FormInstrumentSummary } from '@ddcp/types';
import { useTranslation } from 'react-i18next';

import { InstrumentShowcase } from '../components/InstrumentShowcase';

import { PageHeader, Spinner } from '@/components';
import { useFetch } from '@/hooks/useFetch';

export const AvailableInstrumentsPage = () => {
  const { data } = useFetch<FormInstrumentSummary[]>('/v1/instruments/forms/available');
  const { t } = useTranslation();

  if (!data) {
    return <Spinner />;
  }

  return (
    <div>
      <PageHeader title={t('instruments.availableInstruments.pageTitle')} />
      <InstrumentShowcase instruments={data} />
    </div>
  );
};

export default AvailableInstrumentsPage;
