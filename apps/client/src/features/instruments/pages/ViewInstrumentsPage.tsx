import React from 'react';

import { useQuery } from 'react-query';

import { InstrumentsAPI } from '../api/instruments.api';

import { Divider, Link } from '@/components/base';
import { Spinner } from '@/components/core';

export const ViewInstrumentsPage = () => {
  const { data, isLoading } = useQuery('ViewInstruments', () => InstrumentsAPI.getAvailableInstruments());

  if (isLoading) {
    return <Spinner />;
  }

  return data ? (
    <div>
      <h1 className="text-center">View Instruments</h1>
      <Divider />
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
