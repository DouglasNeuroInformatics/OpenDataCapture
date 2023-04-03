import React, { useState } from 'react';

import { FormInstrumentRecord } from '@ddcp/common';
import { Listbox, Transition } from '@headlessui/react';
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

  const subjectRecords = useFetch<FormInstrumentRecord[]>(
    `/instruments/records?instrument=${params.instrumentName!}&subject=${params.subjectId!}`
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

  return (
    <div>
      <PageHeader title={`${params.instrumentName!}: Records for Subject ${params.subjectId!.slice(0, 6)}`} />
      <div className="flex justify-end p-2">
        <Listbox multiple as="div" className="relative" value={selectedFields} onChange={setSelectedFields}>
          <Listbox.Button as={Button} label="Questions" />
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
        xAxis={{ key: 'dateCollected', label: 'Date Collected' }}
        yAxis={{ label: 'Score' }}
      />
    </div>
  );
};
