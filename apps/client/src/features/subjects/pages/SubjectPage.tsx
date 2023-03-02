import React from 'react';

import { useParams } from 'react-router-dom';

import { PageHeader, Spinner, Table } from '@/components/core';
import { useFetch } from '@/hooks/useFetch';

export const SubjectPage = () => {
  const params = useParams();

  const { data } = useFetch<Array<{ title: string; count: number }>>(
    `/api/instruments/records/available?subject=${params.subjectId!}`
  );

  if (!data) {
    return <Spinner />;
  }

  return (
    <div>
      <PageHeader title={`Instruments for Subject: ${params.subjectId!.slice(0, 6)}`} />
      <Table
        columns={[
          { name: 'Title', field: 'title' },
          { name: 'Number of Records', field: 'count' }
        ]}
        data={data}
        entryLinkFactory={(entry) => `records/${entry.title}`}
      />
    </div>
  );
};

export default SubjectPage;
