import React from 'react';

import { useQuery } from 'react-query';

import { SubjectsAPI } from '../api/subjects.api';
import { SubjectsTable } from '../components/SubjectsTable';

import { Divider } from '@/components/base';
import { PageHeader, Spinner } from '@/components/core';

export const ViewSubjectsPage = () => {
  const { data, isLoading } = useQuery('ViewSubjects', () => SubjectsAPI.getSubjects());

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
