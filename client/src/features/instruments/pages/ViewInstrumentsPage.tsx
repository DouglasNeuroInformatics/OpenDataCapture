import React from 'react';

import { instrumentSchema } from 'common';
import { useQuery } from 'react-query';
import { Link } from 'react-router-dom';
import { z } from 'zod';

import { useAuthStore } from '@/stores/auth';

export const ViewInstrumentsPage = () => {
  const auth = useAuthStore();
  const { data, error } = useQuery('ViewInstruments', async () => {
    const response = await fetch(`${import.meta.env.VITE_API_HOST}/api/instruments/schemas`, {
      headers: {
        Authorization: 'Bearer ' + auth.accessToken!
      }
    });
    return z.array(instrumentSchema).parseAsync(await response.json());
  });

  if (error) {
    console.error(error);
  }

  if (data) {
    console.log(data);
  }

  return (
    data && (
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
    )
  );
};

