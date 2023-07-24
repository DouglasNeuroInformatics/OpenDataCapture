import React, { useContext, useMemo } from 'react';

import { Dropdown, useNotificationsStore } from '@douglasneuroinformatics/ui';
import { useTranslation } from 'react-i18next';

import { VisualizationContext } from '../context/VisualizationContext';

import { InstrumentDropdown } from './InstrumentDropdown';
import { TimeDropdown } from './TimeDropdown';
import { VisualizationHeader } from './VisualizationHeader';

import { Table } from '@/components';
import { useDownload } from '@/hooks/useDownload';
import { useAuthStore } from '@/stores/auth-store';

export const RecordsTable = () => {
  const { selectedInstrument, records } = useContext(VisualizationContext);
  const { t } = useTranslation();
  const { currentUser } = useAuthStore();
  const download = useDownload();
  const notifications = useNotificationsStore();

  const data = useMemo(() => {
    if (!selectedInstrument) {
      return [];
    }

    // const formFields = Array.isArray(selectedInstrument.content)
    //   ? selectedInstrument.content.map(({ fields }) => fields)
    //   : selectedInstrument.content;

    const data: Record<string, any>[] = [];
    for (const record of records) {
      data.push({
        time: record.time,
        ...record.computedMeasures,
        ...record.data
      });
    }
    return data;
  }, [records]);

  const handleDownload = (option: 'CSV' | 'JSON') => {
    if (!selectedInstrument) {
      notifications.addNotification({ type: 'info', message: t('selectInstrument') });
      return;
    }

    const baseFilename = `${currentUser!.username}_${selectedInstrument.name}_${
      selectedInstrument.version
    }_${new Date().toISOString()}`;

    switch (option) {
      case 'JSON':
        download(`${baseFilename}.json`, () => Promise.resolve(JSON.stringify(data, null, 2)));
        break;
      case 'CSV':
        download(`${baseFilename}.csv`, () => {
          const columnNames = Object.keys(data[0]);
          const rows = data.map((item) => Object.values(item).join(',')).join('\n');
          return Promise.resolve(columnNames + '\n' + rows);
        });
    }
  };

  const fields: { name: string; field: string }[] = [];
  for (const subItem in data[0]) {
    if (subItem !== 'time') {
      fields.push({
        name: subItem,
        field: subItem
      });
    }
  }

  return (
    <div>
      <div className="my-2">
        <VisualizationHeader />
        <div className="flex flex-col gap-2 lg:flex-row lg:justify-between">
          <div className="flex flex-col gap-2 lg:flex-row">
            <InstrumentDropdown />
          </div>
          <div className="flex flex-col gap-2 lg:flex-row">
            <TimeDropdown />
            <Dropdown
              className="text-sm"
              options={['CSV', 'JSON']}
              title={t('download')}
              variant="secondary"
              onSelection={handleDownload}
            />
          </div>
        </div>
      </div>
      <Table
        columns={[
          {
            name: t('subjectPage.graph.xLabel'),
            field: 'time',
            format: (value: number) => new Date(value).toISOString()
          },
          ...fields
        ]}
        data={data}
      />
    </div>
  );
};
