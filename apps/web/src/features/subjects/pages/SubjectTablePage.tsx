import { useEffect, useState } from 'react';

import { ClientTable, Dropdown, useDownload } from '@douglasneuroinformatics/ui';
import { camelToSnakeCase, toBasicISOString } from '@douglasneuroinformatics/utils';
import { type UnilingualInstrumentSummary } from '@open-data-capture/common/instrument';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';

import { useFormRecords } from '@/hooks/useFormRecords';
import { useInstrumentSummaries } from '@/hooks/useInstrumentSummaries';
import { useAuthStore } from '@/stores/auth-store';

import { TimeDropdown } from '../components/TimeDropdown';
import { VisualizationHeader } from '../components/VisualizationHeader';

export const SubjectTablePage = () => {
  const { currentGroup, currentUser } = useAuthStore();
  const download = useDownload();
  const params = useParams();
  const [minDate, setMinDate] = useState<Date | null>(null);
  const [tableData, setTableData] = useState<Record<string, unknown>[]>([]);
  const [selectedInstrument, setSelectedInstrument] = useState<UnilingualInstrumentSummary | null>(null);
  const { t } = useTranslation(['subjects', 'core']);

  const instrumentSummariesQuery = useInstrumentSummaries();
  const recordsQuery = useFormRecords({
    enabled: selectedInstrument !== null,
    params: {
      groupId: currentGroup?.id,
      instrumentId: selectedInstrument?.id,
      minDate: minDate ?? undefined,
      subjectId: params.subjectId!
    }
  });

  useEffect(() => {
    if (recordsQuery.data) {
      const data: Record<string, unknown>[] = [];
      for (const record of recordsQuery.data) {
        data.push({
          __date__: record.date,
          ...record.computedMeasures,
          ...record.data
        });
      }
      setTableData(data);
    }
  }, [recordsQuery.data]);

  if (!instrumentSummariesQuery.data) {
    return null;
  }

  const handleDownload = (option: 'CSV' | 'JSON') => {
    if (!selectedInstrument) {
      return; // should never happen, since btn is disabled when none selected
    }
    const baseFilename = `${currentUser!.username}_${selectedInstrument.name}_${
      selectedInstrument.version
    }_${new Date().toISOString()}`;

    switch (option) {
      case 'JSON':
        void download(`${baseFilename}.json`, () => Promise.resolve(JSON.stringify(tableData, null, 2)));
        break;
      case 'CSV':
        void download(`${baseFilename}.csv`, () => {
          const columnNames = Object.keys(tableData[0]);
          const rows = tableData.map((item) => Object.values(item).join(',')).join('\n');
          return Promise.resolve(columnNames + '\n' + rows);
        });
    }
  };

  const instrumentOptions: Record<string, string> = {};
  for (const summary of instrumentSummariesQuery.data) {
    instrumentOptions[summary.id] = summary.details.title;
  }

  const handleSelectInstrument = (id: string) => {
    setSelectedInstrument(instrumentSummariesQuery.data.find((form) => form.id === id) ?? null);
  };

  const fields: { field: string; label: string }[] = [];
  for (const subItem in tableData[0]) {
    if (subItem !== '__date__') {
      fields.push({
        field: subItem,
        label: camelToSnakeCase(subItem).toUpperCase()
      });
    }
  }

  return (
    <div>
      <div className="my-2">
        <VisualizationHeader minDate={minDate} title={selectedInstrument?.details.title} />
        <div className="flex flex-col gap-2 lg:flex-row lg:justify-between">
          <div className="flex flex-col gap-2 lg:flex-row">
            <Dropdown
              className="text-sm"
              options={instrumentOptions}
              title={t('visualization.instrument')}
              variant="secondary"
              onSelection={handleSelectInstrument}
            />
          </div>
          <div className="flex flex-col gap-2 lg:flex-row">
            <TimeDropdown setMinTime={setMinDate} />
            <Dropdown
              className="text-sm"
              options={['CSV', 'JSON']}
              title={t('core:download')}
              variant="secondary"
              onSelection={handleDownload}
            />
          </div>
        </div>
      </div>
      <ClientTable
        columns={[
          {
            field: '__date__',
            formatter: (value: Date) => toBasicISOString(value),
            label: 'DATE_COLLECTED'
          },
          ...fields
        ]}
        data={tableData}
        minRows={10}
      />
    </div>
  );
};
