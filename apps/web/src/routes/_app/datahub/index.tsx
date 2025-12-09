import React from 'react';
import { useEffect, useState } from 'react';
import { toBasicISOString } from '@douglasneuroinformatics/libjs';
import {
  ActionDropdown,
  Button,
  ClientTable,
  Dialog,
  Heading,
  SearchBar
} from '@douglasneuroinformatics/libui/components';
import { useDownload, useNotificationsStore, useTranslation } from '@douglasneuroinformatics/libui/hooks';
import type { InstrumentRecordsExport } from '@opendatacapture/schemas/instrument-records';
import type { Subject } from '@opendatacapture/schemas/subject';
import { removeSubjectIdScope } from '@opendatacapture/subject-utils';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import axios from 'axios';
import { unparse } from 'papaparse';

import { IdentificationForm } from '@/components/IdentificationForm';
import { PageHeader } from '@/components/PageHeader';
import { subjectsQueryOptions, useSubjectsQuery } from '@/hooks/useSubjectsQuery';
import { useAppStore } from '@/store';
import { downloadExcel } from '@/utils/excel';

type MasterDataTableProps = {
  data: Subject[];
  onSelect: (subject: Subject) => void;
};

const MasterDataTable = ({ data, onSelect }: MasterDataTableProps) => {
  const { t } = useTranslation();
  const subjectIdDisplaySetting = useAppStore((store) => store.currentGroup?.settings.subjectIdDisplayLength);

  return (
    <ClientTable<Subject>
      columns={[
        {
          field: (subject) => removeSubjectIdScope(subject.id).slice(0, subjectIdDisplaySetting ?? 9),
          label: t('datahub.index.table.subject')
        },
        {
          field: (subject) => (subject.dateOfBirth ? toBasicISOString(new Date(subject.dateOfBirth)) : 'NULL'),
          label: t('core.identificationData.dateOfBirth.label')
        },
        {
          field: (subject) => {
            switch (subject.sex) {
              case 'FEMALE':
                return t('core.identificationData.sex.female');
              case 'MALE':
                return t('core.identificationData.sex.male');
              default:
                return 'NULL';
            }
          },
          label: t('core.identificationData.sex.label')
        }
      ]}
      data={data}
      data-testid="master-data-table"
      entriesPerPage={15}
      minRows={15}
      onEntryClick={onSelect}
    />
  );
};

const RouteComponent = () => {
  const [isLookupOpen, setIsLookupOpen] = useState(false);

  const currentGroup = useAppStore((store) => store.currentGroup);
  const currentUser = useAppStore((store) => store.currentUser);

  const download = useDownload();
  const addNotification = useNotificationsStore((store) => store.addNotification);
  const { t } = useTranslation();
  const navigate = useNavigate();

  const { data } = useSubjectsQuery({ params: { groupId: currentGroup?.id } });
  const [tableData, setTableData] = useState<Subject[]>(data);
  const [searchString, setSearchString] = useState('');

  const getExportRecords = async () => {
    const response = await axios.get<InstrumentRecordsExport>('/v1/instrument-records/export', {
      params: {
        groupId: currentGroup?.id
      }
    });
    return response.data;
  };

  const handleExportSelection = (option: 'CSV' | 'Excel' | 'JSON') => {
    const baseFilename = `${currentUser!.username}_${new Date().toISOString()}`;
    addNotification({
      message: t({
        en: 'Exporting entries, please wait...',
        fr: 'Téléchargement des entrées, veuillez patienter...'
      }),
      type: 'info'
    });
    getExportRecords()
      .then((data): any => {
        const listedSubjects = tableData.map((record) => {
          return record.id.replace('root$', '');
        });

        const filteredData = data.filter((dataEntry) => listedSubjects.includes(dataEntry.subjectId));

        switch (option) {
          case 'CSV':
            void download('README.txt', t('datahub.index.table.exportHelpText'));
            void download(`${baseFilename}.csv`, unparse(filteredData));
            break;
          case 'Excel':
            return downloadExcel(`${baseFilename}.xlsx`, filteredData);
          case 'JSON':
            return download(`${baseFilename}.json`, JSON.stringify(filteredData, null, 2));
        }
      })
      .then(() => {
        addNotification({
          message: t({ en: 'Export successful', fr: 'Exportation réussie' }),
          type: 'success'
        });
      })
      .catch((err) => {
        console.error(err);
        addNotification({
          message: t({ en: 'Export failed', fr: "Échec de l'exportation" }),
          type: 'error'
        });
      });
  };

  const lookupSubject = async ({ id }: { id: string }) => {
    const response = await axios.get<Subject>(`/v1/subjects/${id}`, {
      validateStatus: (status) => status === 200 || status === 404
    });
    if (response.status === 404) {
      addNotification({ message: t('core.notFound'), type: 'warning' });
      setIsLookupOpen(false);
    } else {
      addNotification({ type: 'success' });
      await navigate({ to: `./${response.data.id}/assignments` });
    }
  };

  useEffect(() => {
    if (!searchString) {
      setTableData(data);
      return;
    }

    const filtered = data.filter((record) =>
      record.id
        .replace(/^.*?\$/, '')
        .toLowerCase()
        .includes(searchString.toLowerCase())
    );

    setTableData(filtered);
  }, [searchString, data]);

  return (
    <React.Fragment>
      <PageHeader>
        <Heading className="text-center" variant="h2">
          {t('datahub.index.title')}
        </Heading>
      </PageHeader>
      <div className="flex grow flex-col">
        <div className="mb-3 flex flex-col justify-between gap-3 lg:flex-row">
          <SearchBar
            className="[&>input]:text-foreground [&>input]:placeholder-foreground grow"
            data-testid="datahub-subject-lookup-search"
            id="subject-lookup-search-bar"
            placeholder={t({
              en: 'Click to Search',
              fr: 'Cliquer pour rechercher'
            })}
            readOnly={false}
            value={searchString}
            onValueChange={(value: string) => setSearchString(value)}
          />
          <Dialog open={isLookupOpen} onOpenChange={setIsLookupOpen}>
            <Dialog.Trigger>
              <Button
                className="[&>input]:text-foreground [&>input]:placeholder-foreground grow"
                data-testid="datahub-subject-lookup-search"
                id="subject-lookup-search-bar"
              >
                {t({
                  en: 'Subject Lookup',
                  fr: 'Cliquer pour rechercher'
                })}
              </Button>
            </Dialog.Trigger>
            <Dialog.Content data-spotlight-type="subject-lookup-modal" data-testid="datahub-subject-lookup-dialog">
              <Dialog.Header>
                <Dialog.Title>{t('datahub.index.lookup.title')}</Dialog.Title>
              </Dialog.Header>
              <IdentificationForm onSubmit={(data) => void lookupSubject(data)} />
            </Dialog.Content>
          </Dialog>
          <div className="flex min-w-60 gap-2 lg:shrink">
            <ActionDropdown
              widthFull
              data-spotlight-type="export-data-dropdown"
              data-testid="datahub-export-dropdown"
              options={['CSV', 'JSON', 'Excel']}
              title={t('datahub.index.table.export')}
              onSelection={handleExportSelection}
            />
          </div>
        </div>
        <MasterDataTable
          data={tableData}
          onSelect={(subject) => {
            void navigate({ to: `./${subject.id}/table` });
          }}
        />
      </div>
    </React.Fragment>
  );
};

export const Route = createFileRoute('/_app/datahub/')({
  component: RouteComponent,
  loader: async ({ context }) => {
    const { currentGroup } = useAppStore.getState();
    await context.queryClient.ensureQueryData(subjectsQueryOptions({ params: { groupId: currentGroup?.id } }));
  }
});
