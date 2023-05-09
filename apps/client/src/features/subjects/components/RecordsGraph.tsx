import React, { useContext } from 'react';

import { DateUtils, SubjectFormRecords } from '@douglasneuroinformatics/common';
import { useTranslation } from 'react-i18next';

import { VisualizationContext } from '../context/VisualizationContext';

import { InstrumentDropdown } from './InstrumentDropdown';
import { MeasuresDropdown } from './MeasuresDropdown';
import { TimeDropdown } from './TimeDropdown';

import { LineGraph } from '@/components';

export interface RecordsGraphProps {
  data: SubjectFormRecords[];
}

export const RecordsGraph = () => {
  const ctx = useContext(VisualizationContext);
  const { t } = useTranslation('subjects');
  return (
    <div className="mx-auto max-w-3xl">
      <div className="ml-[40px] p-2">
        <div className="mb-5">
          <h3 className="text-center text-xl font-medium">
            {ctx.selectedInstrument?.details.title ?? t('subjectPage.graph.defaultTitle')}
          </h3>
          {ctx.minTime && (
            <p className="text-center">
              {DateUtils.toBasicISOString(new Date(ctx.minTime))} - {DateUtils.toBasicISOString(new Date())}
            </p>
          )}
        </div>
        <div className="flex flex-col gap-2 lg:flex-row lg:justify-between">
          <div className="flex flex-col gap-2 lg:flex-row">
            <InstrumentDropdown />
            <MeasuresDropdown />
          </div>
          <div>
            <TimeDropdown />
          </div>
        </div>
      </div>
      <div>
        <LineGraph
          data={ctx.measurements}
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
