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

  console.log(data);

  return data ? (
    <div>
      <h1 className="text-center">Subject Data</h1>
      <p>
        <span className="font-semibold">Subject ID:</span> {params.id}
      </p>
      <div>
        <h3 className="mt-5">Measures</h3>
        {data.map((value) => (
          <div>
            <h5 className="mt-3">Brief Psychiatric Rating Scale</h5>
            <span>
              <span className="block">Date Collected: {value.dateCollected}</span>
              {Object.entries(value.data).map(([key, value]) => (
                <span className="block">
                  {key}: {value}
                </span>
              ))}
            </span>
          </div>
        ))}
      </div>
    </div>
  ) : null;
};

export default SubjectPage;
