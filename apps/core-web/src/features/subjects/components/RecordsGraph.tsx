import React, { useContext, useEffect, useMemo, useState } from 'react';

import { LineGraph, LineGraphLine } from '@douglasneuroinformatics/ui';
import { SubjectFormRecords } from '@open-data-capture/types';
import axios from 'axios';
import { useTranslation } from 'react-i18next';

import { VisualizationContext } from '../context/VisualizationContext';

import { InstrumentDropdown } from './InstrumentDropdown';
import { MeasuresDropdown } from './MeasuresDropdown';
import { TimeDropdown } from './TimeDropdown';
import { VisualizationHeader } from './VisualizationHeader';

type RegressionResults = Record<string, { intercept: number; slope: number; stdErr: number }>;

const COLOR_PALETTE = [
  '#D81B60',
  '#1E88E5',
  '#FD08FA',
  '#A06771',
  '#353A9B',
  '#D90323',
  '#9C9218',
  '#CF0583',
  '#4075A3'
];

export type RecordsGraphProps = {
  data: SubjectFormRecords[];
};

export const RecordsGraph = () => {
  const ctx = useContext(VisualizationContext);
  const { t } = useTranslation();
  const [predicted, setPredicted] = useState<RegressionResults>({});

  const fetchPredicted = async () => {
    new URLSearchParams('');
    const response = await axios.get<RegressionResults>(
      `/v1/instruments/records/forms/linear-regression?instrument=${ctx.selectedInstrument!.identifier}`
    );
    setPredicted(response.data);
  };

  const data = useMemo(() => {
    const arr = ctx.measurements.map((dataPoint) => {
      for (const key in dataPoint) {
        const model = predicted[key];
        if (!model) {
          continue;
        }
        dataPoint[key + 'Group'] = Number((model.intercept + model.slope * dataPoint.time).toFixed(2));
      }
      return dataPoint;
    });
    return arr;
  }, [ctx.measurements]);

  useEffect(() => {
    if (ctx.selectedInstrument) {
      void fetchPredicted();
    }
  }, [ctx.selectedInstrument]);

  const lines: LineGraphLine[] = [];
  for (let i = 0; i < ctx.selectedMeasures.length; i++) {
    const measure = ctx.selectedMeasures[i];
    lines.push({
      name: measure!.label,
      val: measure!.key,
      stroke: COLOR_PALETTE[i]
    });
    lines.push({
      name: `${measure!.label} (${t('groupTrend')})`,
      val: measure!.key + 'Group',
      strokeWidth: 0.5,
      stroke: COLOR_PALETTE[i],
      legendType: 'none',
      strokeDasharray: '5 5'
    });
  }

  return (
    <div className="mx-auto max-w-3xl">
      <div className="py-3">
        <VisualizationHeader />
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
          data={data}
          lines={lines}
          xAxis={{
            key: 'time',
            label: t('subjectPage.graph.xLabel')
          }}
        />
      </div>
    </div>
  );
};
