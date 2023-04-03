import React from 'react';

import { FormInstrumentSummary } from '@ddcp/common';

import { InstrumentCard } from '../components/InstrumentCard';

import { PageHeader, Spinner } from '@/components';
import { useFetch } from '@/hooks/useFetch';

export const AvailableInstrumentsPage = () => {
  const { data } = useFetch<FormInstrumentSummary[]>('/instruments/forms/available');

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
