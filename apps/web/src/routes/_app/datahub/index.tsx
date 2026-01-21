import React, { useEffect, useState } from 'react';

import { toBasicISOString } from '@douglasneuroinformatics/libjs';
import {
  ActionDropdown,
  Button,
  DataTable,
  Dialog,
  Heading,
  SearchBar
} from '@douglasneuroinformatics/libui/components';
import type { TanstackTable } from '@douglasneuroinformatics/libui/components';
import { useDownload, useNotificationsStore, useTranslation } from '@douglasneuroinformatics/libui/hooks';
import type { InstrumentRecordsExport } from '@opendatacapture/schemas/instrument-records';
import type { Subject } from '@opendatacapture/schemas/subject';
import { removeSubjectIdScope } from '@opendatacapture/subject-utils';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import axios from 'axios';
import { UserSearchIcon } from 'lucide-react';
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

const Toggles: React.FC<{ table: TanstackTable.Table<Subject> }> = ({ table }) => {
  const { t } = useTranslation();

  const download = useDownload();
  const addNotification = useNotificationsStore((store) => store.addNotification);

  const currentGroup = useAppStore((store) => store.currentGroup);
  const currentUser = useAppStore((store) => store.currentUser);

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
    getExportRecords()
      .then((data): any => {
        const listedSubjects = table
          .getRowModel()
          .rows.flatMap((row) => row.getVisibleCells().map((cell) => removeSubjectIdScope(cell.row.original.id)));

        const filteredData = data.filter((dataEntry) => listedSubjects.includes(dataEntry.subjectId));

        if (filteredData.length < 1) {
          throw Error(
            t({ en: 'Export failed: No entries to export', fr: "Échec de l'exportation : aucune entrée à exporter" })
          );
        }

        addNotification({
          message: t({
            en: 'Exporting entries, please wait...',
            fr: 'Téléchargement des entrées, veuillez patienter...'
          }),
          type: 'info'
        });

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
        if (err instanceof Error && err.message) {
          addNotification({
            message: err.message,
            type: 'error'
          });
        } else {
          addNotification({
            message: t({ en: 'Export failed', fr: "Échec de l'exportation" }),
            type: 'error'
          });
        }
      });
  };

  return (
    <>
      <ActionDropdown
        widthFull
        className="min-w-48"
        data-spotlight-type="export-data-dropdown"
        data-testid="datahub-export-dropdown"
        options={['CSV', 'JSON', 'Excel']}
        title={t('datahub.index.table.export')}
        onSelection={handleExportSelection}
      />
    </>
  );
  // const table = useDataTableHandle('table', true);
  // const columns = table.getAllColumns();
  // const statusColumn = columns.find((column) => column.id === 'status')!;

  // const filterValue = statusColumn.getFilterValue() as PaymentStatus[];

  // return (
  //   <>
  //     <DropdownMenu>
  //       <DropdownMenu.Trigger asChild>
  //         <Button className="flex items-center gap-2" variant="outline">
  //           Columns
  //           <ChevronDownIcon />
  //         </Button>
  //       </DropdownMenu.Trigger>
  //       <DropdownMenu.Content align="end">
  //         {columns
  //           .filter((column) => column.getCanHide())
  //           .map((column) => {
  //             return (
  //               <DropdownMenu.CheckboxItem
  //                 checked={column.getIsVisible()}
  //                 className="capitalize"
  //                 key={column.id}
  //                 onCheckedChange={(value) => column.toggleVisibility(!!value)}
  //               >
  //                 {column.id}
  //               </DropdownMenu.CheckboxItem>
  //             );
  //           })}
  //       </DropdownMenu.Content>
  //     </DropdownMenu>
  //     <DropdownMenu>
  //       <DropdownMenu.Trigger asChild>
  //         <Button className="flex items-center gap-2" variant="outline">
  //           Filters
  //           <ChevronDownIcon />
  //         </Button>
  //       </DropdownMenu.Trigger>
  //       <DropdownMenu.Content widthFull align="start">
  //         {statuses.map((option) => (
  //           <DropdownMenu.CheckboxItem
  //             checked={filterValue.includes(option)}
  //             className="capitalize"
  //             key={option}
  //             onCheckedChange={(checked) => {
  //               statusColumn.setFilterValue((prevValue: PaymentStatus[]) => {
  //                 if (checked) {
  //                   return [...prevValue, option];
  //                 }
  //                 return prevValue.filter((item) => item !== option);
  //               });
  //             }}
  //           >
  //             {option}
  //           </DropdownMenu.CheckboxItem>
  //         ))}
  //       </DropdownMenu.Content>
  //     </DropdownMenu>
  //   </>
  // );
};

const MasterDataTable = ({ data, onSelect }: MasterDataTableProps) => {
  const { t } = useTranslation();
  const subjectIdDisplaySetting = useAppStore((store) => store.currentGroup?.settings.subjectIdDisplayLength);

  return (
    <div>
      <DataTable
        columns={[
          {
            accessorFn: (subject) => removeSubjectIdScope(subject.id).slice(0, subjectIdDisplaySetting ?? 9),
            header: t('datahub.index.table.subject'),
            id: 'subjectId'
          },
          {
            accessorFn: (subject) => (subject.dateOfBirth ? toBasicISOString(new Date(subject.dateOfBirth)) : 'NULL'),
            header: t('core.identificationData.dateOfBirth.label'),
            id: 'date-of-birth'
          },
          {
            accessorFn: (subject) => {
              switch (subject.sex) {
                case 'FEMALE':
                  return t('core.identificationData.sex.female');
                case 'MALE':
                  return t('core.identificationData.sex.male');
                default:
                  return 'NULL';
              }
            },
            header: t('core.identificationData.sex.label'),
            id: 'sex'
          }
        ]}
        data={data}
        data-testid="master-data-table"
        rowActions={[
          {
            label: t({ en: 'View', fr: 'Voir' }),
            onSelect
          }
        ]}
        togglesComponent={Toggles}
        onSearchChange={(value, table) => {
          const subjectIdColumn = table.getColumn('subjectId')!;
          subjectIdColumn.setFilterValue(value);
        }}
      />
    </div>
  );
};

const RouteComponent = () => {
  const [isLookupOpen, setIsLookupOpen] = useState(false);

  const currentGroup = useAppStore((store) => store.currentGroup);
  const currentUser = useAppStore((store) => store.currentUser);

  const { t } = useTranslation();
  const navigate = useNavigate();

  const { data } = useSubjectsQuery({ params: { groupId: currentGroup?.id } });
  const [tableData, setTableData] = useState<Subject[]>(data ?? []);
  const [searchString, setSearchString] = useState('');

  // const lookupSubject = async ({ id }: { id: string }) => {
  //   const response = await axios.get<Subject>(`/v1/subjects/${id}`, {
  //     validateStatus: (status) => status === 200 || status === 404
  //   });
  //   if (response.status === 404) {
  //     addNotification({ message: t('core.notFound'), type: 'warning' });
  //     setIsLookupOpen(false);
  //   } else {
  //     addNotification({ type: 'success' });
  //     await navigate({ to: `./${response.data.id}/table` });
  //   }
  // };

  // useEffect(() => {
  //   const definedTableData = data ?? [];

  //   if (!searchString) {
  //     setTableData(definedTableData);
  //     return;
  //   }

  //   const filtered = data.filter((record) =>
  //     removeSubjectIdScope(record.id).toLowerCase().includes(searchString.toLowerCase())
  //   );

  //   setTableData(filtered);
  // }, [searchString, data]);

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
            data-testid="datahub-subject-search-bar"
            id="datahub-subject-search-bar"
            placeholder={t({
              en: 'Click to Search',
              fr: 'Cliquer pour rechercher'
            })}
            readOnly={false}
            value={searchString}
            onValueChange={(value: string) => setSearchString(value)}
          />
          <Dialog open={isLookupOpen} onOpenChange={setIsLookupOpen}>
            <Dialog.Trigger asChild>
              <Button
                className="gap-1"
                data-spotlight-type="subject-lookup-search-button"
                data-testid="subject-lookup-search-button"
                id="subject-lookup-search-button"
                variant="outline"
              >
                <UserSearchIcon />{' '}
                {t({
                  en: 'Subject Lookup',
                  fr: 'Trouver un client'
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
            {/* <ActionDropdown
              widthFull
              data-spotlight-type="export-data-dropdown"
              data-testid="datahub-export-dropdown"
              options={['CSV', 'JSON', 'Excel']}
              title={t('datahub.index.table.export')}
              onSelection={handleExportSelection}
            /> */}
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
