import React, { useState } from 'react';

import { FormInstrumentRecord } from '@ddcp/common';
import { Listbox, Transition } from '@headlessui/react';
import { useTranslation } from 'react-i18next';
import { HiCheck } from 'react-icons/hi2';
import { useParams } from 'react-router-dom';

import { Button, LineGraph, PageHeader, Spinner } from '@/components';
import { useFetch } from '@/hooks/useFetch';

function camelToTitleCase(s: string) {
  const result = s.replace(/([A-Z])/g, ' $1');
  return result.charAt(0).toUpperCase() + result.slice(1);
}

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

  return (
    <div>
      <PageHeader title={`${instrumentTitle}: Version ${instrumentVersion.toPrecision(2)}`} />
      <div className="flex items-center justify-between p-2">
        <h3 className="text-xl font-medium text-slate-700">{`${t(
          'subjectRecordsPage.graph.title'
        )}: ${params.subjectId!.slice(0, 6)}`}</h3>
        <Listbox multiple as="div" className="relative" value={selectedFields} onChange={setSelectedFields}>
          <Listbox.Button as={Button} label={t('subjectRecordsPage.graph.fields')} />
          <Transition
            as={React.Fragment}
            leave="transition ease-in duration-100"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Listbox.Options className="absolute right-0 z-10 mt-1 max-h-80 w-auto overflow-scroll rounded-lg bg-slate-100">
              {fields.map((field) => (
                <Listbox.Option
                  className="flex items-center whitespace-nowrap p-2 first:rounded-t-lg last:rounded-b-lg hover:bg-slate-200"
                  key={field}
                  value={field}
                >
                  <HiCheck className="ui-selected:visible invisible mr-2" />
                  {camelToTitleCase(field)}
                </Listbox.Option>
              ))}
            </Listbox.Options>
          </Transition>
        </Listbox>
      </div>
      <LineGraph
        data={graphData}
        xAxis={{ key: 'dateCollected', label: t('subjectRecordsPage.graph.xLabel') }}
        yAxis={{ label: t('subjectRecordsPage.graph.yLabel') }}
      />
    </div>
  );
};
