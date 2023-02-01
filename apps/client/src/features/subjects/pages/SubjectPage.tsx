import React from 'react';

import { useQuery } from 'react-query';
import { useParams } from 'react-router-dom';

import { SubjectsAPI } from '../api/subjects.api';

import { Spinner, Table } from '@/components/core';

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
        <h3 className="mt-5">Brief Psychiatric Rating Scale</h3>
        <Table<{ dateCollected: string; data: Record<string, number> }>
          columns={[
            {
              name: 'Date Collected',
              field: (data) => new Date(data.dateCollected)
            },
            {
              name: 'Average Score',
              field: (data) => Object.values(data.data).reduce((a, b) => a + b) / Object.values(data.data).length
            }
          ]}
          data={data}
        />
      </div>
    </div>
  ) : null;
};

export default SubjectPage;
