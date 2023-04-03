import React from 'react';

import { FormInstrumentSummary } from '@ddcp/common';
import { useTranslation } from 'react-i18next';

import { InstrumentCard } from '../components/InstrumentCard';

import { PageHeader, Spinner } from '@/components';
import { useFetch } from '@/hooks/useFetch';

export const AvailableInstrumentsPage = () => {
  const { data } = useFetch<FormInstrumentSummary[]>('/instruments/forms/available');
  const { t } = useTranslation('instruments');

  if (!data) {
    return <Spinner />;
  }

  return (
    <div>
      <PageHeader title={t('availableInstruments.pageTitle')} />
      <div className="md:mx-6">
        <div className="grid grid-cols-1 gap-5">
          {data.map((instrument, i) => (
            <InstrumentCard instrument={instrument} key={i} />
          ))}
        </div>
      </div>
    </div>
  );
};
