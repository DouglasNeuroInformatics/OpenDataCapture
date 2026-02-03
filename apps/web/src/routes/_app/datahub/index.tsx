import React, { useState } from 'react';

import { toBasicISOString } from '@douglasneuroinformatics/libjs';
import {
  ActionDropdown,
  Button,
  DataTable,
  Dialog,
  DropdownMenu,
  Heading
} from '@douglasneuroinformatics/libui/components';
import type { TanstackTable } from '@douglasneuroinformatics/libui/components';
import { useDownload, useNotificationsStore, useTranslation } from '@douglasneuroinformatics/libui/hooks';
import type { InstrumentRecordsExport } from '@opendatacapture/schemas/instrument-records';
import type { Sex, Subject } from '@opendatacapture/schemas/subject';
import { removeSubjectIdScope } from '@opendatacapture/subject-utils';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import axios from 'axios';
import { ChevronDownIcon, UserSearchIcon } from 'lucide-react';
import { unpack } from 'msgpackr/unpack';
import { unparse } from 'papaparse';

import { IdentificationForm } from '@/components/IdentificationForm';
import { PageHeader } from '@/components/PageHeader';
import { subjectsQueryOptions, useSubjectsQuery } from '@/hooks/useSubjectsQuery';
import { useAppStore } from '@/store';
import { downloadExcel } from '@/utils/excel';

type DateFilter = {
  allowNull: boolean;
  max: Date | null;
  min: Date | null;
};

type SexFilter = (null | Sex)[];

const Filters: React.FC<{ table: TanstackTable.Table<Subject> }> = ({ table }) => {
  const { t } = useTranslation();

  const [isOpen, setIsOpen] = useState(false);

  const columns = table.getAllColumns();

  const dobColumn = columns.find((column) => column.id === 'date-of-birth')!;
  const dobFilter = dobColumn.getFilterValue() as DateFilter;

  const sexColumn = columns.find((column) => column.id === 'sex')!;
  const sexFilter = sexColumn.getFilterValue() as SexFilter;

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenu.Trigger asChild>
        <Button className="flex items-center justify-between gap-2" variant="outline">
          {t({ en: 'Filters', fr: 'Filtres' })}
          <ChevronDownIcon className="opacity-50" />
        </Button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Content align="end" className="w-56">
        <DropdownMenu.Label>{t('core.identificationData.sex.label')}</DropdownMenu.Label>
        <DropdownMenu.Group>
          <DropdownMenu.CheckboxItem
            checked={sexFilter.includes('MALE')}
            onCheckedChange={(checked) => {
              sexColumn.setFilterValue((prevValue: SexFilter): SexFilter => {
                if (checked) {
                  return [...prevValue, 'MALE'];
                }
                return prevValue.filter((item) => item !== 'MALE');
              });
            }}
            onSelect={(e) => e.preventDefault()}
          >
            {t('core.identificationData.sex.male')}
          </DropdownMenu.CheckboxItem>
          <DropdownMenu.CheckboxItem
            checked={sexFilter.includes('FEMALE')}
            onCheckedChange={(checked) => {
              sexColumn.setFilterValue((prevValue: SexFilter): SexFilter => {
                if (checked) {
                  return [...prevValue, 'FEMALE'];
                }
                return prevValue.filter((item) => item !== 'FEMALE');
              });
            }}
            onSelect={(e) => e.preventDefault()}
          >
            {t('core.identificationData.sex.female')}
          </DropdownMenu.CheckboxItem>
          <DropdownMenu.CheckboxItem
            checked={sexFilter.includes(null)}
            onCheckedChange={(checked) => {
              sexColumn.setFilterValue((prevValue: SexFilter): SexFilter => {
                if (checked) {
                  return [...prevValue, null];
                }
                return prevValue.filter((item) => item !== null);
              });
            }}
            onSelect={(e) => e.preventDefault()}
          >
            NULL
          </DropdownMenu.CheckboxItem>
        </DropdownMenu.Group>
        <DropdownMenu.Label>{t('core.identificationData.dateOfBirth.label')}</DropdownMenu.Label>
        <DropdownMenu.Group>
          <div className="rounded-xs relative flex items-center justify-between gap-1 px-2 pb-1 pt-1.5 text-sm transition-colors">
            <span className="pb-1">Min:</span>
            <input
              className="text-muted-foreground pointer-events-auto rounded-sm border-b pb-0.5"
              type="date"
              value={dobFilter.min ? toBasicISOString(dobFilter.min) : ''}
              onChange={(event) => {
                dobColumn.setFilterValue((prevValue: DateFilter): DateFilter => {
                  return {
                    ...prevValue,
                    min: event.target.valueAsDate
                  };
                });
              }}
            />
          </div>
          <div className="rounded-xs relative flex items-center justify-between gap-1 px-2 pb-1 pt-1.5 text-sm transition-colors">
            <span className="pb-1">Max:</span>
            <input
              className="text-muted-foreground pointer-events-auto rounded-sm border-b pb-0.5"
              type="date"
              value={dobFilter.max ? toBasicISOString(dobFilter.max) : ''}
              onChange={(event) => {
                dobColumn.setFilterValue((prevValue: DateFilter): DateFilter => {
                  return {
                    ...prevValue,
                    max: event.target.valueAsDate
                  };
                });
              }}
            />
          </div>
          <DropdownMenu.CheckboxItem
            checked={dobFilter.allowNull}
            onCheckedChange={(checked) => {
              dobColumn.setFilterValue((prevValue: DateFilter): DateFilter => {
                return {
                  ...prevValue,
                  allowNull: checked
                };
              });
            }}
            onSelect={(e) => e.preventDefault()}
          >
            NULL
          </DropdownMenu.CheckboxItem>
        </DropdownMenu.Group>
      </DropdownMenu.Content>
    </DropdownMenu>
  );
};

const Toggles: React.FC<{ table: TanstackTable.Table<Subject> }> = ({ table }) => {
  const navigate = Route.useNavigate();

  const { t } = useTranslation();

  const download = useDownload();
  const addNotification = useNotificationsStore((store) => store.addNotification);

  const currentGroup = useAppStore((store) => store.currentGroup);
  const currentUser = useAppStore((store) => store.currentUser);

  const [isLookupOpen, setIsLookupOpen] = useState(false);

  const lookupSubject = async ({ id }: { id: string }) => {
    const response = await axios.get<Subject>(`/v1/subjects/${id}`, {
      validateStatus: (status) => status === 200 || status === 404
    });
    if (response.status === 404) {
      addNotification({ message: t('core.notFound'), type: 'warning' });
      setIsLookupOpen(false);
    } else {
      addNotification({ type: 'success' });
      await navigate({ to: `./${response.data.id}/table` });
    }
  };

  const getExportRecords = async () => {
    const response = await axios.get<ArrayBuffer>('/v1/instrument-records/export', {
      params: {
        groupId: currentGroup?.id
      },
      responseType: 'arraybuffer'
    });
    return unpack(new Uint8Array(response.data)) as InstrumentRecordsExport;
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
    const waitTime = new Promise((resolve) => {
      setTimeout(resolve, 350);
    });

    getExportRecords()
      .then((data): any => {
        const listedSubjects = table
          .getPrePaginationRowModel()
          .rows.flatMap((row) => row.getVisibleCells().map((cell) => removeSubjectIdScope(cell.row.original.id)));

        const filteredData = data.filter((dataEntry) => listedSubjects.includes(dataEntry.subjectId));

        if (filteredData.length < 1) {
          throw Error(
            t({ en: 'Export failed: No entries to export', fr: "Échec de l'exportation : aucune entrée à exporter" })
          );
        }

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
        return waitTime;
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
    <div className="flex gap-3">
      <Dialog open={isLookupOpen} onOpenChange={setIsLookupOpen}>
        <Dialog.Trigger asChild>
          <Button
            className="gap-2"
            data-spotlight-type="subject-lookup-search-button"
            data-testid="subject-lookup-search-button"
            id="subject-lookup-search-button"
            variant="outline"
          >
            {t({
              en: 'Subject Lookup',
              fr: 'Trouver un client'
            })}
            <UserSearchIcon style={{ strokeWidth: '2px' }} />
          </Button>
        </Dialog.Trigger>
        <Dialog.Content data-spotlight-type="subject-lookup-modal" data-testid="datahub-subject-lookup-dialog">
          <Dialog.Header>
            <Dialog.Title>{t('datahub.index.lookup.title')}</Dialog.Title>
          </Dialog.Header>
          <IdentificationForm onSubmit={(data) => void lookupSubject(data)} />
        </Dialog.Content>
      </Dialog>
      <Filters table={table} />
      <ActionDropdown
        widthFull
        align="end"
        className="font-medium"
        data-spotlight-type="export-data-dropdown"
        data-testid="datahub-export-dropdown"
        options={['CSV', 'JSON', 'Excel']}
        title={t('datahub.index.table.export')}
        onSelection={handleExportSelection}
      />
    </div>
  );
};

const MasterDataTable: React.FC<{
  data: Subject[];
  onSelect: (subject: Subject) => void;
}> = ({ data, onSelect }) => {
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
            accessorFn: (subject) => subject.dateOfBirth,
            cell: (ctx) => {
              const value = ctx.getValue() as Date | null | undefined;
              return value ? toBasicISOString(value) : 'NULL';
            },
            filterFn: (row, id, filter: DateFilter) => {
              const value = row.getValue(id);
              if (!value) {
                return filter.allowNull;
              } else if (filter.max && value > filter.max) {
                return false;
              } else if (filter.min && value < filter.min) {
                return false;
              }
              return true;
            },
            header: t('core.identificationData.dateOfBirth.label'),
            id: 'date-of-birth'
          },
          {
            accessorFn: (subject) => subject.sex ?? null,
            cell: (ctx) => {
              switch (ctx.getValue() as Sex) {
                case 'FEMALE':
                  return t('core.identificationData.sex.female');
                case 'MALE':
                  return t('core.identificationData.sex.male');
                default:
                  return 'NULL';
              }
            },
            filterFn: (row, id, filter: SexFilter) => {
              return filter.includes(row.getValue(id));
            },
            header: t('core.identificationData.sex.label'),
            id: 'sex'
          }
        ]}
        data={data}
        data-testid="master-data-table"
        initialState={{
          columnFilters: [
            {
              id: 'sex',
              value: ['MALE', 'FEMALE', null] satisfies SexFilter
            },
            {
              id: 'date-of-birth',
              value: {
                allowNull: true,
                max: null,
                min: null
              } satisfies DateFilter
            }
          ]
        }}
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
  const currentGroup = useAppStore((store) => store.currentGroup);

  const { t } = useTranslation();
  const navigate = useNavigate();

  const { data } = useSubjectsQuery({ params: { groupId: currentGroup?.id } });

  return (
    <React.Fragment>
      <PageHeader>
        <Heading className="text-center" variant="h2">
          {t('datahub.index.title')}
        </Heading>
      </PageHeader>
      <div className="flex grow flex-col">
        <MasterDataTable
          data={data}
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
