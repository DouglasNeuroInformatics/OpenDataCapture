import React, { useContext } from 'react';

import { useTranslation } from 'react-i18next';

import { VisualizationContext } from '../context/VisualizationContext';

import { InstrumentDropdown } from './InstrumentDropdown';
import { MeasuresDropdown } from './MeasuresDropdown';
import { TimeDropdown } from './TimeDropdown';
import { VisualizationHeader } from './VisualizationHeader';

import { Table } from '@/components';

export const RecordsTable = () => {
  const { selectedMeasures, measurements } = useContext(VisualizationContext);
  const { t } = useTranslation('subjects');

  return (
    <div>
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
      <Table
        columns={[
          {
            name: t('subjectPage.graph.xLabel'),
            field: 'time'
          },
          ...selectedMeasures.map((measure) => ({
            name: measure.label,
            field: measure.key
          }))
        ]}
        data={measurements}
      />
    </div>
  );
};
