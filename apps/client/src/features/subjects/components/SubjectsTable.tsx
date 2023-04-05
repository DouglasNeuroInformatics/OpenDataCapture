import React, { useState } from 'react';

import { InstrumentRecordsExport, Subject } from '@ddcp/common';
import axios from 'axios';
import { useTranslation } from 'react-i18next';

import { SubjectLookup } from './SubjectLookup';

import { Dropdown, SearchBar, Table } from '@/components';
import { useDownload } from '@/hooks/useDownload';

export interface SubjectTableProps {
  data: Subject[];
}

export const SubjectsTable = ({ data }: SubjectTableProps) => {
  const download = useDownload();
  const { t } = useTranslation(['common', 'subjects']);

  const [showLookup, setShowLookup] = useState(false);

  const getExportRecords = async () => {
    const response = await axios.get<InstrumentRecordsExport>('/instruments/records/forms/export');
    return response.data;
  };

  const handleExportSelection = (option: string | ('JSON' | 'CSV')) => {
    switch (option) {
      case 'JSON':
        download('data.json', async () => {
          const data = await getExportRecords();
          return JSON.stringify(data, null, 2);
        });
        break;
      case 'CSV':
        download('foo', () => Promise.resolve('foo.txt'));
        // downloadCSV();
        break;
    }
  };

  /** Called when the user clicks outside the modal */
  const handleLookupClose = () => {
    setShowLookup(false);
  };

  return (
    <>
      <SubjectLookup show={showLookup} onClose={handleLookupClose} />
      <div className="my-5 flex flex-col justify-between gap-5 lg:flex-row">
        <SearchBar onClick={() => setShowLookup(true)} />
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
    </>
  );
};
