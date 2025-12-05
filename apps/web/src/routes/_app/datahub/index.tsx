import React, { useState } from 'react';

import { toBasicISOString } from '@douglasneuroinformatics/libjs';
import {
  ActionDropdown,
  Button,
  Checkbox,
  ClientTable,
  Dialog,
  Heading,
  Label,
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
  const [isLookUpSearch, setLookUpSearch] = useState(true);

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
    if (!isLookUpSearch) {
      setSubjectTable({ id: id });
      return;
    }

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

  const setSubjectTable = ({ id }: { id: string }) => {
    const newSubjects = data.map((record) => {
      if (record.id.includes(id)) {
        return record;
      }
      return;
    });

    const filteredSubjects = newSubjects.filter((record) => record !== undefined);

    if (newSubjects.length < 1) {
      addNotification({ message: t('core.notFound'), type: 'warning' });
    } else {
      addNotification({ type: 'success' });
      setTableData(filteredSubjects);
    }
  };

  return (
    <React.Fragment>
      <PageHeader>
        <Heading className="text-center" variant="h2">
          {t('datahub.index.title')}
        </Heading>
      </PageHeader>
      <div className="flex grow flex-col">
        <div className="mb-3 flex flex-col justify-between gap-3 lg:flex-row">
          <Dialog open={isLookupOpen} onOpenChange={setIsLookupOpen}>
            {isLookUpSearch ? (
              <Dialog.Trigger className="grow">
                <Button
                  className="[&>input]:text-foreground [&>input]:placeholder-foreground grow"
                  data-testid="datahub-subject-lookup-search"
                  id="subject-lookup-search-bar"
                >
                  {t({
                    en: 'Click to Search',
                    fr: 'Cliquer pour rechercher'
                  })}
                </Button>
              </Dialog.Trigger>
            ) : (
              <SearchBar
                className="[&>input]:text-foreground [&>input]:placeholder-foreground grow"
                data-testid="datahub-subject-lookup-search"
                id="subject-lookup-search-bar"
                placeholder={t({
                  en: 'Click to Search',
                  fr: 'Cliquer pour rechercher'
                })}
                readOnly={false}
              />
            )}

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
          <div className="flex min-w-60 gap-2 lg:shrink">
            <Checkbox
              id="Datahub table search mode"
              onCheckedChange={() => setLookUpSearch(!isLookUpSearch)}
            ></Checkbox>
            <Label>
              {' '}
              {t({
                en: 'Enable Datahub Filter Mode',
                fr: 'Activer le mode de filtrage'
              })}
            </Label>
          </div>
          <div className="flex min-w-60 gap-2 lg:shrink">
            <Button label="Reset Datahub" onClick={() => void setTableData(data)} />
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
