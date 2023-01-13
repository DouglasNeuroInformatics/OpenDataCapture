import React from 'react';

import { useQuery } from 'react-query';
import { useParams } from 'react-router-dom';

import useAuth from '@/hooks/useAuth';

const SubjectPage = () => {
  const auth = useAuth();
  const params = useParams();

  const { data, error } = useQuery('Subject', async () => {
    const response = await fetch(`${import.meta.env.VITE_API_HOST}/api/subjects`, {
      headers: {
        Authorization: 'Bearer ' + auth.accessToken!
      }
    });
    return z.array(subjectSchema).parseAsync(await response.json());
  });

  return (
    <div className="text-center">
      <h1>Subject Data</h1>
      <p>Subject ID: {params.id}</p>
    </div>
  );
};

export default SubjectPage;
