import React from 'react';

import { useQuery } from '@tanstack/react-query';

import { SubjectsAPI } from '../api/subjects.api';
import { SubjectsTable } from '../components/SubjectsTable';

import { PageHeader, Spinner } from '@/components/core';

export const ViewSubjectsPage = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['ViewSubjects'],
    queryFn: () => SubjectsAPI.getSubjects()
  });

  if (isLoading) {
    return <Spinner />;
  }

  return data ? (
    <div>
      <PageHeader title="View Subjects" />
      <SubjectsTable data={data} />
    </div>
  ) : null;
};
