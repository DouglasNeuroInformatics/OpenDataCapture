import React from 'react';

import { useQuery } from 'react-query';
import { Link } from 'react-router-dom';

import { InstrumentsAPI } from '../api/instruments.api';

import { Spinner } from '@/components/core';

export const ViewInstrumentsPage = () => {
  const { data, isLoading } = useQuery('ViewInstruments', () => InstrumentsAPI.getAllSchemas());

  if (isLoading) {
    return <Spinner />;
  }

  return data ? (
    <div>
      <h1 className="text-center">View Instruments</h1>
      {data.map((instrument, i) => (
        <div className="card my-5" key={i}>
          <h3>{instrument.name}</h3>
          <p>{instrument.description}</p>
          <Link className="btn-primary mt-2" to={`/instruments/${instrument._id!}`}>
            Start
          </Link>
        </div>
      ))}
    </div>
  ) : null;
};
