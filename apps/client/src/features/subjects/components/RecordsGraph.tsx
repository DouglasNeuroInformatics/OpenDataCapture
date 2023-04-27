import React, { useMemo, useState } from 'react';

import { DateUtils, FormInstrument, SubjectFormRecords } from '@douglasneuroinformatics/common';
import { useTranslation } from 'react-i18next';

import { Dropdown, LineGraph, SelectDropdown } from '@/components';

type RecordsGraphData = Array<{
  [key: string]: any;
  dateObj: Date;
  dateString: string;
}>;

type SelectedMeasure = {
  key: string;
  label: string;
};

/** Apply a callback function to filter items from object */
function filterObj<T extends object>(obj: T, fn: (entry: { key: keyof T; value: T[keyof T] }) => any) {
  const result: Partial<T> = {};
  for (const key in obj) {
    if (fn({ key, value: obj[key] })) {
      result[key] = obj[key];
    }
  }
  return result;
}

export interface RecordsGraphProps {
  data: SubjectFormRecords[];
}

export const RecordsGraph = ({ data }: RecordsGraphProps) => {
  const { t } = useTranslation('subjects');
  const [oldestDate, setOldestDate] = useState<Date | null>(null);
  const [selectedInstrument, setSelectedInstrument] = useState<FormInstrument>();
  const [selectedMeasures, setSelectedMeasures] = useState<SelectedMeasure[]>([]);
  const records = data.find(({ instrument }) => instrument === selectedInstrument)?.records ?? [];

  /** Instrument identifiers mapped to titles */
  const instrumentOptions = Object.fromEntries(
    data
      .filter(({ instrument }) => instrument.measures)
      .map(({ instrument }) => [instrument.identifier, instrument.details.title])
  );

  const measureOptions = useMemo(() => {
    const arr: SelectedMeasure[] = [];
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

  const graphData = useMemo(() => {
    const arr: RecordsGraphData = [];
    for (const record of records) {
      const dateCollected = new Date(record.dateCollected);
      const measures = filterObj(record.computedMeasures!, ({ key }) => {
        return selectedMeasures.find((item) => item.key === key);
      });
      // Whether this date contains a point that should be on the x axis
      const isPoint = (oldestDate === null || dateCollected > oldestDate) && Object.keys(measures).length > 0;
      if (isPoint) {
        arr.push({
          dateObj: dateCollected,
          dateString: DateUtils.toBasicISOString(dateCollected),
          ...measures
        });
      }
    }
    return arr.sort((a, b) => {
      if (a.dateObj > b.dateObj) {
        return 1;
      } else if (b.dateObj > a.dateObj) {
        return -1;
      }
      return 0;
    });
  }, [records, selectedMeasures, oldestDate]);

  return (
    <div className="mx-auto max-w-3xl">
      <div className="ml-[70px] p-2">
        <h3 className="mb-5 text-center text-xl font-medium">
          {selectedInstrument?.details.title ?? t('subjectPage.graph.defaultTitle')}
        </h3>
        <div className="flex justify-between">
          <div className="flex gap-2">
            <Dropdown
              className="text-sm"
              options={instrumentOptions}
              title={t('subjectPage.graph.instrument')}
              variant="light"
              onSelection={(selection) => {
                setSelectedMeasures([]);
                setSelectedInstrument(data.find(({ instrument }) => instrument.identifier === selection)?.instrument);
              }}
            />
            <SelectDropdown
              checkPosition="right"
              className="text-sm"
              options={measureOptions}
              selected={selectedMeasures}
              setSelected={setSelectedMeasures}
              title={t('subjectPage.graph.measures')}
              variant="light"
            />
          </div>
          <div>
            <Dropdown
              className="text-sm"
              options={{
                all: t('subjectPage.graph.timeframeOptions.all'),
                pastYear: t('subjectPage.graph.timeframeOptions.year'),
                pastMonth: t('subjectPage.graph.timeframeOptions.month')
              }}
              title={t('subjectPage.graph.timeframe')}
              variant="light"
              onSelection={(selection) => {
                if (selection === 'pastYear') {
                  setOldestDate(new Date(new Date().setFullYear(new Date().getFullYear() - 1)));
                } else if (selection === 'pastMonth') {
                  setOldestDate(new Date(new Date().setMonth(new Date().getMonth() - 1)));
                } else {
                  setOldestDate(null);
                }
              }}
            />
          </div>
        </div>
      </div>
      <div>
        <LineGraph
          data={graphData}
          legend="bottom"
          lines={selectedMeasures.map((measure) => ({
            name: measure.label,
            val: measure.key
          }))}
          xAxis={{
            key: 'dateString',
            label: t('subjectPage.graph.xLabel')
          }}
          yAxis={{
            label: t('subjectPage.graph.yLabel')
          }}
        />
      </div>
    </div>
  );
};
