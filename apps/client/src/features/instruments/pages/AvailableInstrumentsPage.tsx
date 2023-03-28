import React from 'react';

import { FormSummary } from '@ddcp/common';

import { InstrumentCard } from '../components/InstrumentCard';

import { PageHeader, Spinner } from '@/components';
import { useFetch } from '@/hooks/useFetch';

export const AvailableInstrumentsPage = () => {
  const { data } = useFetch<FormSummary[]>('/instruments/forms/available');

  if (!data) {
    return <Spinner />;
  }

  return (
    <div>
      <PageHeader title="Available Instruments" />
      <div className="flex flex-wrap px-5 py-24">
        <div className="-m-4 flex flex-wrap">
          {data.map((instrument, i) => (
            <InstrumentCard instrument={instrument} key={i} />
          ))}
        </div>
      </div>
    </div>
  );
};
