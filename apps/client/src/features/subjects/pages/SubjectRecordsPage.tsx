import React, { useState } from 'react';

import { FormInstrumentRecord } from '@douglasneuroinformatics/common';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';

import { LineGraph, PageHeader, SelectDropdown, Spinner } from '@/components';
import { useFetch } from '@/hooks/useFetch';

export const SubjectRecordsPage = () => {
  const params = useParams();
  const { t } = useTranslation('subjects');

  const subjectRecords = useFetch<FormInstrumentRecord[]>(
    `/instruments/records/forms?instrument=${params.instrumentName!}&subject=${params.subjectId!}`
  );

  const [selectedFields, setSelectedFields] = useState<string[]>([]);

  if (!subjectRecords.data) {
    return <Spinner />;
  }

  const fields = Object.keys(subjectRecords.data[0].data);

  const graphData = subjectRecords.data.map(({ dateCollected, data }) => {
    const filteredData = Object.fromEntries(
      Object.entries(data).filter((entries) => {
        return selectedFields.includes(entries[0]);
      })
    );
    return { dateCollected: (dateCollected as any as string).split('T')[0], ...filteredData };
  });

  const instrumentTitle = subjectRecords.data[0].instrument.details.title ?? params.instrumentName!;
  const instrumentVersion = subjectRecords.data[0].instrument.version;

  const dropdownOptions = fields.map((fieldName) => ({ key: fieldName, label: fieldName }));

  return (
    <div>
      <PageHeader title={`${instrumentTitle}: Version ${instrumentVersion.toPrecision(2)}`} />
      <div className="flex items-center justify-between p-2">
        <h3 className="text-xl font-medium text-slate-700">{`${t(
          'subjectRecordsPage.graph.title'
        )}: ${params.subjectId!.slice(0, 6)}`}</h3>
        <div className="w-48">
          <SelectDropdown
            options={dropdownOptions}
            title={t('subjectRecordsPage.graph.fields')}
            onChange={(selected) => setSelectedFields(selected.map((item) => item.key))}
          />
        </div>
      </div>
    </div>
  );
};
