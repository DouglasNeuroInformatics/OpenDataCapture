import React from 'react';

import { useQuery } from 'react-query';
import { useParams } from 'react-router-dom';

import useAuth from '@/hooks/useAuth';

const SubjectPage = () => {
  const auth = useAuth();
  const params = useParams();

  const { data, error } = useQuery('Subject', async () => {
    const response = await fetch(`${import.meta.env.VITE_API_HOST}/api/instruments/records?subject=${params.id!}`, {
      headers: {
        Authorization: 'Bearer ' + auth.accessToken!
      }
    });
    return await response.json();
  });

  if (error) {
    alert(JSON.stringify(error));
  }

  return (
    <div className="text-center">
      <h1>Subject Data</h1>
      <p>Subject ID: {params.id}</p>
      <p>{JSON.stringify(data)}</p>
    </div>
  );
};

export default SubjectPage;
