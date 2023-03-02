import React from 'react';

import { SubjectInterface } from 'common';

import { SubjectsTable } from '../components/SubjectsTable';

import { PageHeader, Spinner } from '@/components/core';
import { useFetch } from '@/hooks/useFetch';

export const ViewSubjectsPage = () => {
  const { data } = useFetch<SubjectInterface[]>('/api/subjects');

  if (!data) {
    return <Spinner />;
  }

  return data ? (
    <div>
      <PageHeader title="View Subjects" />
      <SubjectsTable data={data} />
    </div>
  ) : null;
};
