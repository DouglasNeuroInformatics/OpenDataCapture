import React from 'react';

import { Subject } from '@ddcp/common';
import { useTranslation } from 'react-i18next';

import { Dropdown, SearchBar, Table } from '@/components';
import { useDownload } from '@/hooks/useDownload';

export interface SubjectTableProps {
  data: Subject[];
}

export const SubjectsTable = ({ data }: SubjectTableProps) => {
  const downloadJSON = useDownload('/api/v0/instruments/records/export-json', 'records.json');
  const downloadCSV = useDownload('/api/v0/instruments/records/export-csv', 'records.csv');

  const { t } = useTranslation(['common', 'subjects']);

  const handleExportSelection = (option: string | ('JSON' | 'CSV')) => {
    switch (option) {
      case 'JSON':
        downloadJSON();
        break;
      case 'CSV':
        downloadCSV();
        break;
    }
  };

  return (
    <div>
      <div className="my-5 flex flex-col justify-between gap-5 lg:flex-row">
        <SearchBar />
        <div className="flex flex-grow gap-2 lg:flex-shrink">
          <Dropdown options={[]} title={t('subjects:viewSubjects.table.filters')} onSelection={() => null} />
          <Dropdown
            options={['CSV', 'JSON']}
            title={t('subjects:viewSubjects.table.export')}
            onSelection={handleExportSelection}
          />
        </div>
      </div>
      <Table<Subject>
        columns={[
          {
            name: t('subjects:viewSubjects.table.columns.subject'),
            field: (subject) => subject.identifier.slice(0, 6)
          },
          {
            name: t('subjects:viewSubjects.table.columns.dateOfBirth'),
            field: (subject) => subject.dateOfBirth
          },
          {
            name: t('subjects:viewSubjects.table.columns.sex'),
            field: (subject) => (subject.sex === 'female' ? t('common:sex.female') : t('common:sex.male'))
          }
        ]}
        data={data}
        entryLinkFactory={(subject) => subject.identifier}
      />
    </div>
  );
};
