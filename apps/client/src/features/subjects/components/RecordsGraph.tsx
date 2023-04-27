import React, { useMemo, useState } from 'react';

import { FormInstrument, SubjectFormRecords } from '@douglasneuroinformatics/common';

import { ArrowToggle, Dropdown, LineGraph, SelectDropdown } from '@/components';

const DropdownToggle = ({ text }: { text: string }) => (
  <ArrowToggle className="border px-3 py-1" content={text} contentPosition="left" position="up" rotation={180} />
);

export interface RecordsGraphProps {
  data: SubjectFormRecords[];
}
export const RecordsGraph = ({ data }: RecordsGraphProps) => {
  const [selectedInstrument, setSelectedInstrument] = useState<FormInstrument>();
  const records = data.find(({ instrument }) => instrument === selectedInstrument)?.records;

  /** Instrument identifiers mapped to titles */
  const instrumentOptions = Object.fromEntries(
    data
      .filter(({ instrument }) => instrument.measures)
      .map(({ instrument }) => [instrument.identifier, instrument.details.title])
  );

  const measureOptions = useMemo(() => {
    const arr: Array<{ key: string; label: string }> = [];
    if (selectedInstrument) {
      for (const measure in selectedInstrument.measures) {
        arr.push({
          key: measure,
          label: selectedInstrument.measures[measure].label
        });
      }
    }
    return arr;
  }, [selectedInstrument]);

  if (records) {
    console.log(records[0].computedMeasures);
  }

  // console.log(selectedInstrument, records);

  return (
    <div className="mx-auto max-w-3xl">
      <div className="ml-[70px] p-2">
        <h3 className="mb-5 text-center text-xl font-medium">
          {selectedInstrument?.details.title ?? 'Please Select an Instrument'}
        </h3>
        <div className="flex justify-between">
          <div className="flex gap-2">
            <Dropdown
              options={instrumentOptions}
              title="Instrument"
              variant="light"
              onSelection={(selection) => {
                setSelectedInstrument(data.find(({ instrument }) => instrument.identifier === selection)?.instrument);
              }}
            />
            <SelectDropdown
              options={measureOptions}
              title="Measures"
              variant="light"
              onChange={(selected) => console.log(selected)}
            />
          </div>
          <DropdownToggle text="Timeframe" />
        </div>
      </div>
      <div>
        <LineGraph
          data={[
            {
              x: '1',
              y: 1
            },
            {
              x: '2',
              y: 2
            },
            {
              x: ' 3',
              y: 3
            }
          ]}
          legend={null}
          lines={[
            {
              name: 'Value',
              val: 'y'
            }
          ]}
          xAxis={{
            key: 'x',
            label: 'X'
          }}
          yAxis={{
            label: 'Y'
          }}
        />
      </div>
    </div>
  );
};
