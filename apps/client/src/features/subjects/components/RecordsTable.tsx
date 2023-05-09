import React, { useContext } from 'react';

import { useTranslation } from 'react-i18next';

import { VisualizationContext } from '../context/VisualizationContext';

import { InstrumentDropdown } from './InstrumentDropdown';
import { MeasuresDropdown } from './MeasuresDropdown';
import { TimeDropdown } from './TimeDropdown';
import { VisualizationHeader } from './VisualizationHeader';

import { Dropdown, Table } from '@/components';
import { useDownload } from '@/hooks/useDownload';
import { useAuthStore } from '@/stores/auth-store';
import { useNotificationsStore } from '@/stores/notifications-store';

export const RecordsTable = () => {
  const { selectedInstrument, selectedMeasures, measurements } = useContext(VisualizationContext);
  const { t } = useTranslation(['common', 'subjects']);
  const { currentUser } = useAuthStore();
  const download = useDownload();
  const notifications = useNotificationsStore();

  const handleDownload = (option: 'CSV' | 'JSON') => {
    if (!selectedInstrument) {
      notifications.add({ type: 'info', message: t('selectInstrument') });
      return;
    } else if (selectedMeasures.length === 0) {
      notifications.add({ type: 'info', message: t('selectMeasures') });
      return;
    }

    const baseFilename = `${currentUser!.username}_${selectedInstrument.name}_${
      selectedInstrument.version
    }_${new Date().toISOString()}`;

    switch (option) {
      case 'JSON':
        download(`${baseFilename}.json`, () => Promise.resolve(JSON.stringify(measurements, null, 2)));
        break;
      case 'CSV':
        download(`${baseFilename}.csv`, () => {
          const columnNames = Object.keys(measurements[0]);
          const rows = measurements.map((record) => Object.values(record).join(',')).join('\n');
          return Promise.resolve(columnNames + '\n' + rows);
        });
    }
  };

  return (
    <div>
      <div className="my-2">
        <VisualizationHeader />
        <div className="flex flex-col gap-2 lg:flex-row lg:justify-between">
          <div className="flex flex-col gap-2 lg:flex-row">
            <InstrumentDropdown />
            <MeasuresDropdown />
          </div>
          <div className="flex flex-col gap-2 lg:flex-row">
            <TimeDropdown />
            <Dropdown
              className="text-sm"
              options={['CSV', 'JSON']}
              title={t('download')}
              variant="light"
              onSelection={handleDownload}
            />
          </div>
        </div>
      </div>
      <Table
        columns={[
          {
            name: t('subjects:subjectPage.graph.xLabel'),
            field: 'time',
            format: (value: number) => new Date(value).toISOString()
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
