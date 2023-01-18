import React from 'react';

import { useQuery } from 'react-query';
import { Link } from 'react-router-dom';

import { InstrumentsAPI } from '../api/instruments.api';

import { Spinner } from '@/components/core';

export const ViewInstrumentsPage = () => {
  const { data, isLoading } = useQuery('ViewInstruments', () => InstrumentsAPI.getAvailableInstruments());
  console.log(data);

  if (isLoading) {
    return <Spinner />;
  }

  return data ? (
    <div>
      <h1 className="text-center">View Instruments</h1>
      {data.map((instrument, i) => (
        <div className="card my-5" key={i}>
          <h3 className="font-medium">{instrument.title}</h3>
          <p>{instrument.details.description}</p>
          <Link
            className="mt-2 w-20 rounded-lg bg-indigo-800 p-2 text-center font-medium text-white"
            to={`/instruments/${instrument.title}`}
          >
            Start
          </Link>
        </div>
      ))}
    </div>
  ) : null;
};
