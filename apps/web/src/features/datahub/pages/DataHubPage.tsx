import React from 'react';

import { ActionDropdown, Dialog, Heading, SearchBar } from '@douglasneuroinformatics/libui/components';
import { useDownload, useNotificationsStore } from '@douglasneuroinformatics/libui/hooks';
import type { InstrumentRecordsExport } from '@opendatacapture/schemas/instrument-records';
import type { Subject, SubjectIdentificationData } from '@opendatacapture/schemas/subject';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import { IdentificationForm } from '@/components/IdentificationForm';
import { LoadingFallback } from '@/components/LoadingFallback';
import { PageHeader } from '@/components/PageHeader';
import { useAppStore } from '@/store';

import { MasterDataTable } from '../components/MasterDataTable';
import { useSubjectsQuery } from '../hooks/useSubjectsQuery';

export const DataHubPage = () => {
  const currentGroup = useAppStore((store) => store.currentGroup);
  const currentUser = useAppStore((store) => store.currentUser);

  const download = useDownload();
  const addNotification = useNotificationsStore((store) => store.addNotification);
  const { t } = useTranslation(['datahub', 'core']);
  const navigate = useNavigate();

  const { data } = useSubjectsQuery({ params: { groupId: currentGroup?.id } });

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

  const lookupSubject = async (data: SubjectIdentificationData) => {
    const response = await axios.post<Subject>('/v1/subjects/lookup', data, {
      validateStatus: (status) => status === 200 || status === 404
    });
    if (response.status === 404) {
      addNotification({ message: t('core:notFound'), type: 'warning' });
      return;
    }
    addNotification({ type: 'success' });
    navigate(`${response.data.id}/assignments`);
  };

  return (
    <React.Fragment>
      <PageHeader>
        <Heading className="text-center" variant="h2">
          {t('index.title')}
        </Heading>
      </PageHeader>
      <React.Suspense fallback={<LoadingFallback />}>
        <div>
          <div className="my-3 flex flex-col justify-between gap-3 lg:flex-row">
            <Dialog>
              <Dialog.Trigger className="flex-grow">
                <SearchBar className="[&>input]:text-foreground [&>input]:placeholder-foreground" readOnly={true} />
              </Dialog.Trigger>
              <Dialog.Content>
                <Dialog.Header>
                  <Dialog.Title>{t('index.lookup.title')}</Dialog.Title>
                </Dialog.Header>
                <IdentificationForm fillCurrentSession onSubmit={(data) => void lookupSubject(data)} />
              </Dialog.Content>
            </Dialog>
            <div className="flex min-w-60 gap-2 lg:flex-shrink">
              <ActionDropdown
                options={['CSV', 'JSON']}
                title={t('index.table.export')}
                onSelection={handleExportSelection}
              />
            </div>
          </div>
          <MasterDataTable
            data={data}
            onSelect={(subject) => {
              navigate(`${subject.id}/assignments`);
            }}
          />
        </div>
      </React.Suspense>
    </React.Fragment>
  );
};
