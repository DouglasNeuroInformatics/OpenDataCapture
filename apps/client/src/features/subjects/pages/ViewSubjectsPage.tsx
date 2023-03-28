import React from 'react';

import { Subject } from '@ddcp/common';

import { SubjectsTable } from '../components/SubjectsTable';

import { PageHeader, Spinner } from '@/components';
import { useFetch } from '@/hooks/useFetch';

export const ViewSubjectsPage = () => {
  const { data } = useFetch<Subject[]>('/subjects');

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
