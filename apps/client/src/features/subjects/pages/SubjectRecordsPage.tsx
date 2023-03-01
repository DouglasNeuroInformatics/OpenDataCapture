import React from 'react';

import { useQuery } from 'react-query';
import { useParams } from 'react-router-dom';

import { SubjectsAPI } from '../api/subjects.api';

import { PageHeader } from '@/components/core';

export const SubjectRecordsPage = () => {
  const params = useParams();
  const { data } = useQuery('SubjectRecords', () =>
    SubjectsAPI.getInstrumentRecords(params.instrumentTitle!, params.subjectId!)
  );

  if (!data) {
    return null;
  }

  const instrumentFields = data[0].data;

  return (
    <div>
      <PageHeader title={`${params.instrumentTitle!}: Records for Subject ${params.subjectId!.slice(0, 6)}`} />
      <p>{JSON.stringify(instrumentFields)}</p>
      <p>Subject Records {JSON.stringify(data, null, 2)}</p>
    </div>
  );
};
