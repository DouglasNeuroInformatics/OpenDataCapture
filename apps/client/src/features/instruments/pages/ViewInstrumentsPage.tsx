import React from 'react';

import { BaseInstrumentInterface } from 'common';

import { Link } from '@/components/base';
import { PageHeader, Spinner } from '@/components/core';
import { useFetch } from '@/hooks/useFetch';

export const ViewInstrumentsPage = () => {
  const { data } = useFetch<BaseInstrumentInterface[]>('/api/instruments/available');

  if (!data) {
    return <Spinner />;
  }

  return (
    <div>
      <PageHeader title="View Instruments" />
      {data.map((instrument, i) => (
        <div className="card my-5" key={i}>
          <h3 className="font-medium">{instrument.title}</h3>
          <p>{instrument.details.description}</p>
          <Link className="mt-2" to={`/instruments/${instrument.title}`} variant="btn-dark">
            Start
          </Link>
        </div>
      ))}
    </div>
  );
};
