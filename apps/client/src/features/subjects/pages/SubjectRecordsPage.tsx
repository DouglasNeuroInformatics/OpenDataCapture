import React from 'react';

import { useQuery } from 'react-query';
import { useParams } from 'react-router-dom';

import { SubjectsAPI } from '../api/subjects.api';

import { PageHeader } from '@/components/core';
import { LineGraph } from '@/components/graph';

export const SubjectRecordsPage = () => {
  const params = useParams();
  const { data } = useQuery('SubjectRecords', () =>
    SubjectsAPI.getInstrumentRecords(params.instrumentTitle!, params.subjectId!)
  );

  if (!data) {
    return null;
  }

  const instrumentFields = Object.keys(data[0].data);
  const graphData = data.map(({ dateCollected, data }) => ({ dateCollected, ...data }));

  return (
    <div>
      <PageHeader title={`${params.instrumentTitle!}: Records for Subject ${params.subjectId!.slice(0, 6)}`} />
      <LineGraph
        data={graphData}
        xAxis={{ key: 'dateCollected', label: 'Date Collected' }}
        yAxis={{ label: 'Score' }}
      />
    </div>
  );
};
