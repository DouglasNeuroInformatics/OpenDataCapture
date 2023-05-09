import React, { useContext, useMemo, useState } from 'react';

import { DateUtils, SubjectFormRecords } from '@douglasneuroinformatics/common';
import { useTranslation } from 'react-i18next';

import { VisualizationContext } from '../context/VisualizationContext';
import { RecordsGraphData } from '../types';

import { MeasuresDropdown } from './MeasuresDropdown';

import { Dropdown, LineGraph } from '@/components';

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
  const ctx = useContext(VisualizationContext);
  const { t } = useTranslation('subjects');
  const [oldestTime, setOldestTime] = useState<number | null>(null);

  const graphData = useMemo(() => {
    const arr: RecordsGraphData = [];
    for (const record of ctx.records) {
      const measures = filterObj(record.computedMeasures!, ({ key }) => {
        return ctx.selectedMeasures.find((item) => item.key === key);
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
  }, [ctx.records, ctx.selectedMeasures, oldestTime]);

  return (
    <div className="mx-auto max-w-3xl">
      <div className="ml-[40px] p-2">
        <div className="mb-5">
          <h3 className="text-center text-xl font-medium">
            {ctx.selectedInstrument?.details.title ?? t('subjectPage.graph.defaultTitle')}
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
              options={ctx.instrumentOptions}
              title={t('subjectPage.graph.instrument')}
              variant="light"
              onSelection={(selection) => {
                ctx.setSelectedMeasures([]);
                ctx.setSelectedInstrument(
                  ctx.data.find(({ instrument }) => instrument.identifier === selection)?.instrument ?? null
                );
              }}
            />
            <MeasuresDropdown
              options={ctx.measureOptions}
              selected={ctx.selectedMeasures}
              setSelected={ctx.setSelectedMeasures}
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
          lines={ctx.selectedMeasures.map((measure) => ({
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
