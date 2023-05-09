import React, { useContext, useEffect, useMemo, useState } from 'react';

import { DateUtils, FormInstrumentRecordsSummary, SubjectFormRecords } from '@douglasneuroinformatics/common';
import { useTranslation } from 'react-i18next';

import { VisualizationContext } from '../context/VisualizationContext';
import { useInstrumentOptions } from '../hooks/useInstrumentOptions';
import { RecordsGraphData, SelectedInstrument, SelectedMeasure } from '../types';

import { MeasuresDropdown } from './MeasuresDropdown';

import { Dropdown, LineGraph } from '@/components';
import { useFetch } from '@/hooks/useFetch';
import { useAuthStore } from '@/stores/auth-store';

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

export const RecordsGraph = () => {
  const { data } = useContext(VisualizationContext);
  const { t } = useTranslation('subjects');
  const [oldestTime, setOldestTime] = useState<number | null>(null);
  const [selectedInstrument, setSelectedInstrument] = useState<SelectedInstrument | null>();
  const [selectedMeasures, setSelectedMeasures] = useState<SelectedMeasure[]>([]);
  const records = data.find(({ instrument }) => instrument === selectedInstrument)?.records ?? [];

  const { currentGroup } = useAuthStore();
  const summary = useFetch<FormInstrumentRecordsSummary>('/v1/instruments/records/forms/summary', [], {
    queryParams: {
      group: currentGroup?.name,
      instrument: selectedInstrument?.identifier
    }
  });

  /** Instrument identifiers mapped to titles */
  const instrumentOptions = useInstrumentOptions(data);

  // If language changes
  useEffect(() => {
    setSelectedInstrument(null);
    setSelectedMeasures([]);
  }, [data]);

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
      const measures = filterObj(record.computedMeasures!, ({ key }) => {
        return selectedMeasures.find((item) => item.key === key);
      });
      // Whether this date contains a point that should be on the x axis
      const isPoint = (oldestTime === null || record.time > oldestTime) && Object.keys(measures).length > 0;
      if (isPoint) {
        arr.push({
          time: record.time,
          ...measures
        });
      }
    }
    return arr.sort((a, b) => {
      if (a.time > b.time) {
        return 1;
      } else if (b.time > a.time) {
        return -1;
      }
      return 0;
    });
  }, [records, selectedMeasures, oldestTime]);

  return (
    <div className="mx-auto max-w-3xl">
      <div className="ml-[40px] p-2">
        <div className="mb-5">
          <h3 className="text-center text-xl font-medium">
            {selectedInstrument?.details.title ?? t('subjectPage.graph.defaultTitle')}
          </h3>
          {oldestTime && (
            <p className="text-center">
              {DateUtils.toBasicISOString(new Date(oldestTime))} - {DateUtils.toBasicISOString(new Date())}
            </p>
          )}
        </div>
        <div className="flex flex-col gap-2 lg:flex-row lg:justify-between">
          <div className="flex flex-col gap-2 lg:flex-row">
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
            <MeasuresDropdown options={measureOptions} selected={selectedMeasures} setSelected={setSelectedMeasures} />
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
                  setOldestTime(new Date(new Date().setFullYear(new Date().getFullYear() - 1)).getTime());
                } else if (selection === 'pastMonth') {
                  setOldestTime(new Date(new Date().setMonth(new Date().getMonth() - 1)).getTime());
                } else {
                  setOldestTime(null);
                }
              }}
            />
          </div>
        </div>
      </div>
      <div>
        <LineGraph
          data={graphData}
          lines={selectedMeasures.map((measure) => ({
            name: measure.label,
            val: measure.key
          }))}
          xAxis={{
            key: 'time',
            label: t('subjectPage.graph.xLabel')
          }}
        />
      </div>
    </div>
  );
};
