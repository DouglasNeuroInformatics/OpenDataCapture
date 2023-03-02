import React, { useState } from 'react';

import { Listbox, Transition } from '@headlessui/react';
import { useQuery } from '@tanstack/react-query';
import { HiCheck } from 'react-icons/hi2';
import { useParams } from 'react-router-dom';

import { SubjectsAPI } from '../api/subjects.api';

import { Button } from '@/components/base';
import { PageHeader } from '@/components/core';
import { LineGraph } from '@/components/graph';

export const SubjectRecordsPage = () => {
  const params = useParams();
  const { data } = useQuery({
    queryKey: ['SubjectRecords'],
    queryFn: () => SubjectsAPI.getInstrumentRecords(params.instrumentTitle!, params.subjectId!)
  });

  const [selectedFields, setSelectedFields] = useState<string[]>([]);

  if (!data) {
    return null;
  }

  const fields = Object.keys(data[0].data);

  const graphData = data.map(({ dateCollected, data }) => {
    const filteredData = Object.fromEntries(
      Object.entries(data).filter((entries) => {
        return selectedFields.includes(entries[0]);
      })
    );
    return { dateCollected: dateCollected.split('T')[0], ...filteredData };
  });

  return (
    <div>
      <PageHeader title={`${params.instrumentTitle!}: Records for Subject ${params.subjectId!.slice(0, 6)}`} />
      <div className="flex justify-between p-2">
        <h3>Line Graph</h3>
        <Listbox multiple as="div" className="relative" value={selectedFields} onChange={setSelectedFields}>
          <Listbox.Button as={Button} label="Questions" />
          <Transition
            as={React.Fragment}
            leave="transition ease-in duration-100"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Listbox.Options className="absolute right-0 z-10 bg-slate-100">
              {fields.map((field) => (
                <Listbox.Option className="flex items-center p-2" key={field} value={field}>
                  <HiCheck className="ui-selected:block mr-2 hidden" />
                  {field}
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
