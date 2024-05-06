import React, { useState } from 'react';

import { toBasicISOString } from '@douglasneuroinformatics/libjs';
import { DropdownMenu, LegacyClientTable, LegacyDropdown, SearchBar } from '@douglasneuroinformatics/libui/components';
import { useDownload } from '@douglasneuroinformatics/libui/hooks';
import type { InstrumentRecordsExport } from '@opendatacapture/schemas/instrument-records';
import type { Subject } from '@opendatacapture/schemas/subject';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import { useAppStore } from '@/store';

import { useSubjectsQuery } from '../hooks/useSubjectsQuery';
import { SubjectLookup } from './SubjectLookup';

export const SubjectsTable = () => {
  const currentGroup = useAppStore((store) => store.currentGroup);
  const currentUser = useAppStore((store) => store.currentUser);

  const { data } = useSubjectsQuery({ params: { groupId: currentGroup?.id } });
  const download = useDownload();
  const navigate = useNavigate();

  const { t } = useTranslation(['subjects', 'core']);

  const [showLookup, setShowLookup] = useState(false);

  const getExportRecords = async () => {
    const response = await axios.get<InstrumentRecordsExport>('/v1/instrument-records/export', {
      params: {
        groupId: currentGroup?.id
      }
    });
    return response.data;
  };

  const handleExportSelection = (option: 'CSV' | 'JSON') => {
    const baseFilename = `${currentUser!.username}_${new Date().toISOString()}`;
    switch (option) {
      case 'JSON':
        void download(`${baseFilename}.json`, async () => {
          const data = await getExportRecords();
          return JSON.stringify(data, null, 2);
        });
        break;
      case 'CSV':
        void download('README.txt', () => Promise.resolve(t('index.table.exportHelpText')));
        void download(`${baseFilename}.csv`, async () => {
          const data = await getExportRecords();
          const columnNames = Object.keys(data[0]).join(',');
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
          className="flex-grow"
          onClick={() => {
            setShowLookup(true);
          }}
        />
        <div className="flex min-w-60 gap-2 lg:flex-shrink">
          <DropdownMenu>
            <DropdownMenu.Trigger></DropdownMenu.Trigger>
          </DropdownMenu>
          <LegacyDropdown
            options={['CSV', 'JSON']}
            title={t('index.table.export')}
            onSelection={handleExportSelection}
          />
        </div>
      </div>
      <LegacyClientTable<Subject>
        columns={[
          {
            field: (subject) => subject.id.slice(0, 7),
            label: t('index.table.subject')
          },
          {
            field: (subject) => toBasicISOString(new Date(subject.dateOfBirth)),
            label: t('core:identificationData.dateOfBirth.label')
          },
          {
            field: (subject) =>
              subject.sex === 'FEMALE'
                ? t('core:identificationData.sex.female')
                : t('core:identificationData.sex.male'),
            label: t('core:identificationData.sex.label')
          }
        ]}
        data={data}
        onEntryClick={(subject) => {
          navigate(`${subject.id}/assignments`);
        }}
      />
    </>
  );
};
