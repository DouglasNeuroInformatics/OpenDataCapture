import React from 'react';

import { useQuery } from 'react-query';
import { useParams } from 'react-router-dom';

import { SubjectsAPI } from '../api/subjects.api';

import { Spinner } from '@/components/core';

export const SubjectPage = () => {
  const params = useParams();
  const { data, isLoading } = useQuery('Subject', () => SubjectsAPI.getSubjectInstrumentRecords(params.id!));

  if (isLoading) {
    return <Spinner />;
  }

  return data ? (
    <div>
      <h1 className="text-center">Subject Data</h1>
      <p>
        <span className="font-semibold">Subject ID:</span> {params.id}
      </p>
      <div>
        <h3 className="mt-5">Measures</h3>
        {data &&
          Object.values(data).map((value) => (
            <span key={data.instrument}>
              {JSON.stringify(value)}
            </span>
          ))}
      </div>
    </div>
  ) : null;
};

export default SubjectPage;
