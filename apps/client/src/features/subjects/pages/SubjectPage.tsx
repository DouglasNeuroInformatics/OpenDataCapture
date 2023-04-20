import React from 'react';

import { FormInstrumentRecord } from '@douglasneuroinformatics/common';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';

import { PageHeader, Spinner, Table } from '@/components';
import { useFetch } from '@/hooks/useFetch';

export const SubjectPage = () => {
  const params = useParams();
  const { t } = useTranslation('subjects');

  const { data } = useFetch<FormInstrumentRecord[]>(`/instruments/records/forms?subject=${params.subjectId!}`);

  if (!data) {
    return <Spinner />;
  }

  const summaryData: Record<string, { count: number; title: string; version: number }> = {};
  for (const record of data) {
    const name = record.instrument.name;
    const title = data.find((record) => record.instrument.name === name)?.instrument.details.title ?? name;
    if (!summaryData[name]) {
      summaryData[name] = { count: 1, title, version: record.instrument.version };
    } else {
      summaryData[name].count++;
    }
  }

  return (
    <div>
      <PageHeader title={`${t('subjectPage.pageTitle')}: ${params.subjectId!.slice(0, 6)}`} />
      <Table
        columns={[
          { name: t('subjectPage.table.columns.title'), field: 'title' },
          { name: t('subjectPage.table.columns.version'), field: 'version' },
          { name: t('subjectPage.table.columns.nRecords'), field: 'count' }
        ]}
        data={Object.keys(summaryData).map((name) => ({ name, ...summaryData[name] }))}
        entryLinkFactory={(entry) => `records/${entry.name}`}
      />
    </div>
  );
};

export default SubjectPage;
