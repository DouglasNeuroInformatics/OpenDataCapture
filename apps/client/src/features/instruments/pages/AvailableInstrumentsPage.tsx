import React from 'react';

import { FormSummary } from '@ddcp/common';

import { Link, PageHeader, Spinner } from '@/components';
import { useFetch } from '@/hooks/useFetch';

export const AvailableInstrumentsPage = () => {
  const { data } = useFetch<FormSummary[]>('/instruments/forms/available');

  if (!data) {
    return <Spinner />;
  }

  return (
    <div>
      <PageHeader title="Available Instruments" />
      {data.map((instrument, i) => (
        <div className="card my-5" key={i}>
          <h3 className="font-medium">{instrument.details.title}</h3>
          <p>{instrument.details.description}</p>
          <Link className="mt-2" to={instrument._id} variant="btn-dark">
            Start
          </Link>
        </div>
      ))}
    </div>
  );
};
