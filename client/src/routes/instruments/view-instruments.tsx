import React from 'react';

import { instrumentSchema } from 'common';
import { useQuery } from 'react-query';
import { z } from 'zod';

import useAuth from '@/hooks/useAuth';

// import { useQuery } from 'react-query';

const ViewInstrumentsPage = () => {
  const auth = useAuth();
  const { data, error } = useQuery('ViewInstruments', async () => {
    const response = await fetch(`${import.meta.env.VITE_API_HOST}/api/instruments`, {
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
    <div>
      <h1>View Instruments</h1>
    </div>
  );
};

export { ViewInstrumentsPage as default };
