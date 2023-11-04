import { useEffect, useState } from 'react';

import type { FormDataType } from '@douglasneuroinformatics/form-types';
import { ClientTable, Dropdown, useDownload } from '@douglasneuroinformatics/ui';
import { camelToSnakeCase, toBasicISOString } from '@douglasneuroinformatics/utils';
import type { Language } from '@open-data-capture/common/core';
import { type InstrumentSummary } from '@open-data-capture/common/instrument';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';

import { useAvailableForms } from '@/hooks/useAvailableForms';
import { useFormRecords } from '@/hooks/useFormRecords';
import { useAuthStore } from '@/stores/auth-store';

import { VisualizationHeader } from '../components/VisualizationHeader';

export const SubjectTablePage = () => {
  const { currentGroup, currentUser } = useAuthStore();
  const download = useDownload();
  const params = useParams();
  const [minDate, setMinDate] = useState<Date | null>(null);
  const [tableData, setTableData] = useState<Record<string, unknown>[]>([]);
  const [selectedForm, setSelectedForm] = useState<InstrumentSummary<FormDataType, Language> | null>(null);
  const { t } = useTranslation(['subjects', 'common']);

  const formsQuery = useAvailableForms();
  const recordsQuery = useFormRecords({
    enabled: selectedForm !== null,
    params: {
      groupId: currentGroup?.id,
      instrumentId: selectedForm?.id,
      subjectIdentifier: params.subjectIdentifier!
    }
  });

  useEffect(() => {
    if (recordsQuery.data) {
      const data: Record<string, unknown>[] = [];
      for (const record of recordsQuery.data) {
        data.push({
          date: record.date,
          ...record.computedMeasures,
          ...record.data
        });
      }
      setTableData(data);
    }
  }, [recordsQuery.data]);

  if (!formsQuery.data) {
    return null;
  }

  const handleDownload = (option: 'CSV' | 'JSON') => {
    if (!selectedForm) {
      return; // should never happen, since btn is disabled when none selected
    }
    const baseFilename = `${currentUser!.username}_${selectedForm.name}_${
      selectedForm.version
    }_${new Date().toISOString()}`;

    switch (option) {
      case 'JSON':
        download(`${baseFilename}.json`, () => Promise.resolve(JSON.stringify(tableData, null, 2)));
        break;
      case 'CSV':
        download(`${baseFilename}.csv`, () => {
          const columnNames = Object.keys(tableData[0]!);
          const rows = tableData.map((item) => Object.values(item).join(',')).join('\n');
          return Promise.resolve(columnNames + '\n' + rows);
        });
    }
  };

  const formOptions: Record<string, string> = {};
  for (const form of formsQuery.data) {
    formOptions[form.id!] = form.details.title;
  }

  const handleSelectForm = (id: string) => {
    setSelectedForm(formsQuery.data.find((form) => form.id === id) ?? null);
  };

  const fields: { field: string; label: string }[] = [];
  for (const subItem in tableData[0]) {
    if (subItem !== 'date') {
      fields.push({
        field: subItem,
        label: camelToSnakeCase(subItem).toUpperCase()
      });
    }
  }

  return (
    <div>
      <div className="my-2">
        <VisualizationHeader minDate={minDate} title={selectedForm?.details.title} />
        <div className="flex flex-col gap-2 lg:flex-row lg:justify-between">
          <div className="flex flex-col gap-2 lg:flex-row">
            <Dropdown
              className="text-sm"
              options={formOptions}
              title={t('visualization.instrument')}
              variant="secondary"
              onSelection={handleSelectForm}
            />
          </div>
          <div className="flex flex-col gap-2 lg:flex-row">
            <Dropdown
              className="text-sm"
              options={{
                all: t('visualization.timeframeOptions.all'),
                pastMonth: t('visualization.timeframeOptions.month'),
                pastYear: t('visualization.timeframeOptions.year')
              }}
              title={t('visualization.timeframe')}
              variant="secondary"
              onSelection={(selection) => {
                if (selection === 'pastYear') {
                  setMinDate(new Date(new Date().setFullYear(new Date().getFullYear() - 1)));
                } else if (selection === 'pastMonth') {
                  setMinDate(new Date(new Date().setMonth(new Date().getMonth() - 1)));
                } else {
                  setMinDate(null);
                }
              }}
            />
            <Dropdown
              className="text-sm"
              options={['CSV', 'JSON']}
              title={t('common:download')}
              variant="secondary"
              onSelection={handleDownload}
            />
          </div>
        </div>
      </div>
      <ClientTable
        columns={[
          {
            field: 'date',
            formatter: (value: Date) => toBasicISOString(value),
            label: 'DATE_COLLECTED'
          },
          ...fields
        ]}
        data={tableData}
      />
    </div>
  );
};
