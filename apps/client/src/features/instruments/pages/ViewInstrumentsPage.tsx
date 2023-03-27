import React from 'react';

import { FormInstrument } from '@ddcp/common';

import { Link, PageHeader, Spinner } from '@/components';
import { useFetch } from '@/hooks/useFetch';

export const ViewInstrumentsPage = () => {
  const { data } = useFetch<FormInstrument[]>('/api/v0/instruments/available');

  if (!data) {
    return <Spinner />;
  }

  return (
    <div>
      <PageHeader title="View Instruments" />
      {data.map((instrument, i) => (
        <div className="card my-5" key={i}>
          <h3 className="font-medium">{instrument.details.title}</h3>
          <p>{instrument.details.description}</p>
          <Link className="mt-2" to={`/instruments/${instrument.details.title}`} variant="btn-dark">
            Start
          </Link>
        </div>
      ))}
    </div>
  );
};
