import React from 'react';

import { FormInstrumentRecord } from '@ddcp/common';
import { useParams } from 'react-router-dom';

import { PageHeader, Spinner, Table } from '@/components';
import { useFetch } from '@/hooks/useFetch';

export const SubjectPage = () => {
  const params = useParams();

  const { data } = useFetch<FormInstrumentRecord[]>(`/instruments/records?subject=${params.subjectId!}`);

  if (!data) {
    return <Spinner />;
  }

  const summaryData: Record<string, { count: number }> = {};
  for (const record of data) {
    if (!summaryData[record.instrument.name]) {
      summaryData[record.instrument.name] = { count: 1 };
    } else {
      summaryData[record.instrument.name].count++;
    }
  }

  return (
    <div>
      <PageHeader title={`Instruments for Subject: ${params.subjectId!.slice(0, 6)}`} />
      <Table
        columns={[
          { name: 'Title', field: 'name' },
          { name: 'Number of Records', field: 'count' }
        ]}
        data={Object.keys(summaryData).map((name) => ({ name, ...summaryData[name] }))}
        entryLinkFactory={(entry) => `records/${entry.name}`}
      />
    </div>
  );
};

export default SubjectPage;
