import React from 'react';

import { useQuery } from '@tanstack/react-query';

import { InstrumentsAPI } from '../api/instruments.api';

import { Link } from '@/components/base';
import { PageHeader, Spinner } from '@/components/core';

export const ViewInstrumentsPage = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['ViewInstruments'],
    queryFn: () => InstrumentsAPI.getAvailableInstruments()
  });

  if (isLoading) {
    return <Spinner />;
  }

  return data ? (
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
  ) : null;
};
