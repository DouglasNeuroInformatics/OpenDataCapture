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
    <div className="text-center">
      <h1>Subject Data</h1>
      <p>Subject ID: {params.id}</p>
      <p>{JSON.stringify(data)}</p>
    </div>
  ) : null;
};

export default SubjectPage;
