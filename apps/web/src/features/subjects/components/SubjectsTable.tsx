import { useState } from 'react';

import { ClientTable, Dropdown, SearchBar, useDownload } from '@douglasneuroinformatics/ui';
import { toBasicISOString } from '@douglasneuroinformatics/utils';
import type { InstrumentRecordsExport } from '@open-data-capture/common/instrument';
import type { Subject } from '@open-data-capture/common/subject';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import { useAuthStore } from '@/stores/auth-store';

import { SubjectLookup } from './SubjectLookup';

export type SubjectTableProps = {
  data: Subject[];
};

export const SubjectsTable = ({ data }: SubjectTableProps) => {
  const download = useDownload();
  const navigate = useNavigate();
  const { currentGroup, currentUser } = useAuthStore();
  const { t } = useTranslation(['subjects', 'common']);

  const [showLookup, setShowLookup] = useState(false);

  const getExportRecords = async () => {
    const url = '/v1/instruments/records/forms/export' + (currentGroup ? `?group=${currentGroup.name}` : '');
    const response = await axios.get<InstrumentRecordsExport>(url);
    return response.data;
  };

  const handleExportSelection = (option: 'CSV' | 'JSON') => {
    const baseFilename = `${currentUser!.username}_${new Date().toISOString()}`;
    switch (option) {
      case 'JSON':
        download(`${baseFilename}.json`, async () => {
          const data = await getExportRecords();
          return JSON.stringify(data, null, 2);
        });
        break;
      case 'CSV':
        download('README.txt', () => Promise.resolve(t('index.table.exportHelpText')));
        download(`${baseFilename}.csv`, async () => {
          const data = await getExportRecords();
          const columnNames = Object.keys(data[0]!);
          const rows = data.map((record) => Object.values(record).join(',')).join('\n');
          return columnNames + '\n' + rows;
        });
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
      <div className="my-3 flex flex-col justify-between gap-3 lg:flex-row">
        <SearchBar
          size="md"
          onClick={() => {
            setShowLookup(true);
          }}
        />
        <div className="flex flex-grow gap-2 lg:flex-shrink">
          <Dropdown options={[]} size="sm" title={t('index.table.filters')} onSelection={() => null} />
          <Dropdown
            options={['CSV', 'JSON']}
            size="sm"
            title={t('index.table.export')}
            onSelection={handleExportSelection}
          />
        </div>
      </div>
      <ClientTable<Subject>
        columns={[
          {
            field: (subject) => subject.identifier.slice(0, 6),
            label: t('index.table.subject')
          },
          {
            field: (subject) => toBasicISOString(new Date(subject.dateOfBirth)),
            label: t('common:identificationData.dateOfBirth.label')
          },
          {
            field: (subject) =>
              subject.sex === 'female'
                ? t('common:identificationData.sex.female')
                : t('common:identificationData.sex.male'),
            label: t('common:identificationData.sex.label')
          }
        ]}
        data={data}
        onEntryClick={(subject) => {
          navigate(`${subject.identifier}/assignments`);
        }}
      />
    </>
  );
};
