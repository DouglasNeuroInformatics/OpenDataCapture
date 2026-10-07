import React, { useMemo, useRef, useState } from 'react';

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
import { useDownload, useNotificationsStore, useTheme, useTranslation } from '@douglasneuroinformatics/libui/hooks';
import type { InstrumentRecordsExport } from '@opendatacapture/schemas/instrument-records';
import type { Sex, Subject } from '@opendatacapture/schemas/subject';
import { removeSubjectIdScope } from '@opendatacapture/subject-utils';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import axios from 'axios';
import { ChevronDownIcon, UserSearchIcon } from 'lucide-react';
import { unpack } from 'msgpackr/unpack';
import { unparse } from 'papaparse';

import { CollectedFilterMenu } from '@/components/CollectedFilterMenu';
import { ColorTagCell } from '@/components/ColorTagCell';
import { IdentificationForm } from '@/components/IdentificationForm';
import { PageHeader } from '@/components/PageHeader';
import { SearchSubmitGuard } from '@/components/SearchSubmitGuard';
import { SortableHeader } from '@/components/SortableHeader';
import { subjectRecordSummaryQueryOptions, useSubjectRecordSummaryQuery } from '@/hooks/useSubjectRecordSummaryQuery';
import { subjectsQueryOptions, useSubjectsQuery } from '@/hooks/useSubjectsQuery';
import { useAppStore } from '@/store';
import { DEFAULT_COLLECTED_FILTER, matchesCollectedFilter } from '@/utils/collected-filter';
import type { CollectedFilter } from '@/utils/collected-filter';
import { downloadSubjectTableExcel } from '@/utils/excel';
import { getListedSubjectIds } from '@/utils/table';
import { getSexColor } from '@/utils/tag-colors';

type DateFilter = {
  allowNull: boolean;
  max: Date | null;
  min: Date | null;
};

type SexFilter = (null | Sex)[];

type HasSearchStringFilter = {
  searchString: string;
};

const Filters: React.FC<{
  minRecords: string;
  setMinRecords: (v: string) => void;
  table: TanstackTable.Table<Subject>;
}> = ({ minRecords, setMinRecords, table }) => {
  const { t } = useTranslation();

  const [isOpen, setIsOpen] = useState(false);

  const columns = table.getAllColumns();

  const collectedColumn = columns.find((column) => column.id === 'lastCollectedAt')!;
  const collectedFilter = collectedColumn.getFilterValue() as CollectedFilter;

  const dobColumn = columns.find((column) => column.id === 'dateOfBirth')!;
  const dobFilter = dobColumn.getFilterValue() as DateFilter;

  const sexColumn = columns.find((column) => column.id === 'sex')!;
  const sexFilter = sexColumn.getFilterValue() as SexFilter;

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenu.Trigger asChild>
        <Button
          className="flex grow items-center justify-between gap-2 md:grow-0"
          data-testid="datahub-filters-trigger"
          variant="outline"
        >
          {t('common.filters')}
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
            {t({ en: 'NULL', es: 'NULL', fr: 'NULL' })}
          </DropdownMenu.CheckboxItem>
        </DropdownMenu.Group>
        <DropdownMenu.Label>{t('core.identificationData.dateOfBirth.label')}</DropdownMenu.Label>
        <DropdownMenu.Group>
          <div className="relative flex items-center justify-between gap-1 rounded-xs px-2 pt-1.5 pb-1 text-sm transition-colors">
            <span className="pb-1">{t({ en: 'Min:', es: 'Mín.:', fr: 'Min :' })}</span>
            <input
              className="bg-popover text-foreground pointer-events-auto rounded-sm border-b pb-0.5"
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
          <div className="relative flex items-center justify-between gap-1 rounded-xs px-2 pt-1.5 pb-1 text-sm transition-colors">
            <span className="pb-1">{t({ en: 'Max:', es: 'Máx.:', fr: 'Max :' })}</span>
            <input
              className="bg-popover text-foreground pointer-events-auto rounded-sm border-b pb-0.5"
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
            {t({ en: 'NULL', es: 'NULL', fr: 'NULL' })}
          </DropdownMenu.CheckboxItem>
        </DropdownMenu.Group>
        <DropdownMenu.Label>{t({ en: 'Records', es: 'Registros', fr: 'Enregistrements' })}</DropdownMenu.Label>
        <DropdownMenu.Group>
          {/* A minimum of one is what the old "with records only" checkbox meant, so the two
              controls collapsed into this one rather than sitting beside each other saying
              nearly the same thing. */}
          <div className="relative flex items-center justify-between gap-1 rounded-xs px-2 pt-1.5 pb-1 text-sm transition-colors">
            <span className="pb-1">{t({ en: 'At least:', es: 'Al menos:', fr: 'Au moins :' })}</span>
            <input
              className="bg-popover text-foreground pointer-events-auto w-16 rounded-sm border-b pb-0.5"
              data-testid="datahub-filter-min-records"
              min={0}
              placeholder={t({ en: 'Any', es: 'Cualquiera', fr: 'Tous' })}
              type="number"
              // Held as the raw string: coercing to a number on every keystroke re-seeded a `0` the
              // moment the field was cleared, so typed digits landed after it instead of replacing it.
              value={minRecords}
              onChange={(event) => setMinRecords(event.target.value)}
            />
          </div>
          <CollectedFilterMenu
            testIdPrefix="datahub-filter"
            value={collectedFilter}
            onChange={(next) => collectedColumn.setFilterValue(next)}
          />
        </DropdownMenu.Group>
      </DropdownMenu.Content>
    </DropdownMenu>
  );
};

const Toggles: React.FC<{
  minRecords: string;
  setMinRecords: (v: string) => void;
  table: TanstackTable.Table<Subject>;
}> = ({ minRecords, setMinRecords, table }) => {
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
      meta: {
        disableDefaultTimeout: true
      },
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
        es: 'Exportando entradas, espere...',
        fr: 'Téléchargement des entrées, veuillez patienter...'
      }),
      type: 'info'
    });
    const waitTime = new Promise((resolve) => {
      setTimeout(resolve, 350);
    });

    getExportRecords()
      .then((data): any => {
        const listedSubjects = getListedSubjectIds(table);

        const filteredData = data.filter((dataEntry) => listedSubjects.has(dataEntry.subjectId));

        if (filteredData.length < 1) {
          throw Error(
            t({
              en: 'Export failed: No entries to export',
              es: 'Error al exportar: no hay entradas que exportar',
              fr: "Échec de l'exportation : aucune entrée à exporter"
            })
          );
        }

        const exportData = filteredData.map(({ seriesId: _, ...rest }) => rest);

        switch (option) {
          case 'CSV':
            void download('README.txt', t('datahub.index.table.exportHelpText'));
            void download(`${baseFilename}.csv`, unparse(exportData));
            break;
          case 'Excel':
            return downloadSubjectTableExcel(`${baseFilename}.xlsx`, exportData, 'Records');
          case 'JSON':
            return download(`${baseFilename}.json`, JSON.stringify(exportData, null, 2));
        }
      })
      .then(() => {
        return waitTime;
      })
      .then(() => {
        addNotification({
          message: t({ en: 'Export successful', es: 'Exportación realizada correctamente', fr: 'Exportation réussie' }),
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
            message: t({ en: 'Export failed', es: 'Error al exportar', fr: "Échec de l'exportation" }),
            type: 'error'
          });
        }
      });
  };

  return (
    <div className="flex flex-wrap gap-3 md:flex-nowrap">
      <Dialog open={isLookupOpen} onOpenChange={setIsLookupOpen}>
        <Dialog.Trigger asChild>
          <Button
            className="grow gap-2 md:grow-0"
            data-spotlight-type="subject-lookup-search-button"
            data-testid="subject-lookup-search-button"
            id="subject-lookup-search-button"
            variant="outline"
          >
            {t({
              en: 'Subject Lookup',
              es: 'Buscar sujeto',
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
      <Filters minRecords={minRecords} setMinRecords={setMinRecords} table={table} />
      <ActionDropdown
        widthFull
        align="end"
        className="font-medium"
        data-spotlight-type="export-data-dropdown"
        data-testid="datahub-export-dropdown"
        options={['CSV', 'JSON', 'Excel']}
        title={t('core.download')}
        onSelection={handleExportSelection}
      />
    </div>
  );
};

const MasterDataTable: React.FC<{
  data: Subject[];
  onRowDoubleClick: (subject: Subject) => void;
  onSelect: (subject: Subject) => void;
}> = ({ data, onRowDoubleClick, onSelect }) => {
  const { t } = useTranslation();
  const [theme] = useTheme();
  const currentGroup = useAppStore((store) => store.currentGroup);
  const subjectIdDisplaySetting = currentGroup?.settings.subjectIdDisplayLength;

  const [minRecords, setMinRecords] = useState('');
  // An empty field means no minimum, which is why the parse falls back to zero rather than NaN.
  const minRecordCount = Number.parseInt(minRecords, 10) || 0;
  const [searchString, setSearchString] = useState('');
  const [highlightedRowId, setHighlightedRowId] = useState<null | string>(null);

  const summaryQuery = useSubjectRecordSummaryQuery({ params: { groupId: currentGroup?.id } });
  const summaries = useMemo(
    () => new Map(summaryQuery.data.map((summary) => [summary.subjectId, summary])),
    [summaryQuery.data]
  );

  // Filtered here rather than through the server's `hasRecord` parameter: the counts are already
  // loaded for the column, so re-querying bought nothing and made the control lag a keystroke
  // behind — `useSuspenseQuery` suspends on every parameter change, leaving the stale set on screen.
  const displayData = useMemo(() => {
    if (minRecordCount <= 0) {
      return data;
    }
    return data.filter((subject) => (summaries.get(subject.id)?.recordCount ?? 0) >= minRecordCount);
  }, [data, minRecordCount, summaries]);

  const minRecordsRef = useRef(minRecords);
  minRecordsRef.current = minRecords;

  const TogglesWithFilter = useMemo(() => {
    const Component = (props: { table: TanstackTable.Table<Subject> }) => (
      <Toggles {...props} minRecords={minRecordsRef.current} setMinRecords={setMinRecords} />
    );
    Component.displayName = 'TogglesWithFilter';
    return Component;
  }, []);

  return (
    <SearchSubmitGuard>
      <DataTable
        columnBreakpoints={{ 0: 1, 512: 1, 768: 2, 1024: 4, 1280: 4 }}
        columns={[
          {
            accessorFn: (subject) => removeSubjectIdScope(subject.id),
            cell: (ctx) => {
              const subject = ctx.row.original;
              const value = (ctx.getValue() as string).slice(0, subjectIdDisplaySetting ?? 9);
              return (
                <span className="flex items-center">
                  {value}
                  <span className="hidden" data-row-selected={highlightedRowId === subject.id ? 'true' : 'false'} />
                </span>
              );
            },
            filterFn: (row, id, filter: HasSearchStringFilter) => {
              const value = row.getValue(id);
              if (!value) {
                return false;
              }
              if (filter.searchString) {
                return (value as string).toLowerCase().includes(filter.searchString.toLowerCase());
              }
              return true;
            },
            header: ({ column }) => <SortableHeader column={column} label={t('datahub.index.table.subject')} />,
            id: 'subjectId',
            // Only a pinned column keeps its own width — `calculateColumnSizing` gives every
            // unpinned one an equal share of what is left. Pinning the identifier is what widens it
            // and narrows the date, sex and count columns beside it.
            size: 260
          },
          {
            accessorKey: 'dateOfBirth',
            cell: (ctx) => {
              const value = ctx.getValue() as Date | null | undefined;
              return value ? toBasicISOString(value) : t({ en: 'NULL', es: 'NULL', fr: 'NULL' });
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
            header: ({ column }) => (
              <SortableHeader column={column} label={t('core.identificationData.dateOfBirth.label')} />
            )
          },
          {
            accessorFn: (subject) => subject.sex ?? null,
            cell: (ctx) => {
              const sex = ctx.getValue() as null | Sex;
              const label =
                sex === 'FEMALE'
                  ? t('core.identificationData.sex.female')
                  : sex === 'MALE'
                    ? t('core.identificationData.sex.male')
                    : t({ en: 'NULL', es: 'NULL', fr: 'NULL' });
              return (
                <ColorTagCell
                  color={getSexColor(sex, theme === 'dark' ? 'dark' : 'light')}
                  data-testid="subject-cell-sex"
                  label={label}
                />
              );
            },
            filterFn: (row, id, filter: SexFilter) => {
              return filter.includes(row.getValue(id));
            },
            header: ({ column }) => <SortableHeader column={column} label={t('core.identificationData.sex.label')} />,
            id: 'sex'
          },
          {
            accessorFn: (subject) => summaries.get(subject.id)?.recordCount ?? 0,
            header: ({ column }) => (
              <SortableHeader column={column} label={t({ en: 'Records', es: 'Registros', fr: 'Enregistrements' })} />
            ),
            id: 'recordCount'
          },
          {
            accessorFn: (subject) => summaries.get(subject.id)?.lastCollectedAt ?? null,
            cell: (ctx) => {
              const value = ctx.getValue() as Date | null;
              return value ? toBasicISOString(value) : t({ en: 'None', es: 'Ninguno', fr: 'Aucun' });
            },
            filterFn: (row, id, filter: CollectedFilter) =>
              matchesCollectedFilter(row.getValue<Date | null>(id), filter),
            header: ({ column }) => (
              <SortableHeader
                column={column}
                label={t({ en: 'Last Collected', es: 'Última recopilación', fr: 'Dernière collecte' })}
              />
            ),
            id: 'lastCollectedAt'
          }
        ]}
        data={displayData}
        data-testid="master-data-table"
        initialState={{
          columnPinning: { left: ['subjectId'] },
          // eslint-disable-next-line perfectionist/sort-objects
          columnFilters: [
            {
              id: 'subjectId',
              value: {
                searchString
              } satisfies HasSearchStringFilter
            },
            {
              id: 'sex',
              value: ['MALE', 'FEMALE', null] satisfies SexFilter
            },
            {
              id: 'dateOfBirth',
              value: {
                allowNull: true,
                max: null,
                min: null
              } satisfies DateFilter
            },
            {
              id: 'lastCollectedAt',
              value: DEFAULT_COLLECTED_FILTER
            }
          ]
        }}
        rowActions={[
          {
            label: t({ en: 'View', es: 'Ver', fr: 'Voir' }),
            onSelect
          }
        ]}
        togglesComponent={TogglesWithFilter}
        onRowClick={(subject) => setHighlightedRowId(subject.id)}
        onRowDoubleClick={onRowDoubleClick}
        onSearchChange={(value, table) => {
          setSearchString(value);
          const subjectIdColumn = table.getColumn('subjectId')!;
          subjectIdColumn.setFilterValue((prevValue: HasSearchStringFilter): HasSearchStringFilter => ({
            ...prevValue,
            searchString: value
          }));
        }}
      />
    </SearchSubmitGuard>
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
          onRowDoubleClick={(subject) => {
            void navigate({ to: `./${subject.id}/table` });
          }}
          onSelect={(subject) => {
            void navigate({ to: `./${subject.id}/table` });
          }}
        />
      </div>
    </React.Fragment>
  );
};

export const Route = createFileRoute('/_app/datahub/subjects/')({
  component: RouteComponent,
  loader: async ({ context }) => {
    const { currentGroup } = useAppStore.getState();
    await Promise.all([
      context.queryClient.ensureQueryData(subjectsQueryOptions({ params: { groupId: currentGroup?.id } })),
      context.queryClient.ensureQueryData(subjectRecordSummaryQueryOptions({ params: { groupId: currentGroup?.id } }))
    ]);
  }
});
