import { useMemo, useState } from 'react';

import { camelToSnakeCase, toBasicISOString } from '@douglasneuroinformatics/libjs';
import {
  ActionDropdown,
  Button,
  DataTable,
  DropdownMenu,
  TanstackTable
} from '@douglasneuroinformatics/libui/components';
import { useTranslation } from '@douglasneuroinformatics/libui/hooks';
import type { InstrumentKind } from '@opendatacapture/runtime-core';
import { $SessionType } from '@opendatacapture/schemas/session';
import type { SessionType } from '@opendatacapture/schemas/session';
import { removeSubjectIdScope } from '@opendatacapture/subject-utils';
import { createFileRoute } from '@tanstack/react-router';
import { ChevronDownIcon } from 'lucide-react';

import { InstrumentTable } from '@/components/InstrumentTable';
import type { InstrumentRow } from '@/components/InstrumentTable';
import { SelectEdition } from '@/components/SelectEdition';
import { SortableHeader } from '@/components/SortableHeader';
import { TimeDropdown } from '@/components/TimeDropdown';
import { TruncatedCell } from '@/components/TruncatedCell';
import { useCollectionMethodLabels } from '@/hooks/useCollectionMethodLabels';
import { NO_SERIES, useInstrumentHubFacets } from '@/hooks/useInstrumentHubFacets';
import { useInstrumentHubRecords } from '@/hooks/useInstrumentHubRecords';
import { useInstrumentInfoById } from '@/hooks/useInstrumentInfoById';
import type { InstrumentVisualizationRecord } from '@/hooks/useInstrumentVisualization';
import { useRecordMetadataColumns } from '@/hooks/useRecordMetadataColumns';
import { useAppStore } from '@/store';
import { formatRecordValue } from '@/utils/record-value';

const COLLECTION_METHODS = $SessionType.options;

const FIXED_COLUMN_PREFIX = '__';

const INDIVIDUAL_LABEL_KEY = 'individual';

const Filters = ({ seriesOptions }: { seriesOptions: Map<string, null | string> }) => {
  const navigate = Route.useNavigate();
  const { methods, series } = Route.useSearch();
  const { t } = useTranslation();
  const collectionMethodLabels = useCollectionMethodLabels();

  const [isOpen, setIsOpen] = useState(false);

  const selectedMethods = methods ?? COLLECTION_METHODS;
  const selectedSeries = series ?? Array.from(seriesOptions.keys());

  const setMethods = (next: SessionType[]) => {
    void navigate({ search: (prev) => ({ ...prev, methods: next }) });
  };
  const setSeries = (next: string[]) => {
    void navigate({ search: (prev) => ({ ...prev, series: next }) });
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenu.Trigger asChild>
        <Button
          className="flex items-center justify-between gap-2"
          data-testid="instrument-hub-filters-trigger"
          variant="outline"
        >
          {t('common.filters')}
          <ChevronDownIcon className="opacity-50" />
        </Button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Content align="end" className="w-64">
        <DropdownMenu.Label>
          {t({ en: 'Collection method', es: 'Método de recopilación', fr: 'Méthode de collecte' })}
        </DropdownMenu.Label>
        <DropdownMenu.Group>
          {COLLECTION_METHODS.map((method) => (
            <DropdownMenu.CheckboxItem
              checked={selectedMethods.includes(method)}
              data-testid={`instrument-hub-filter-method-${method}`}
              key={method}
              onCheckedChange={(checked) => {
                setMethods(checked ? [...selectedMethods, method] : selectedMethods.filter((item) => item !== method));
              }}
              onSelect={(e) => e.preventDefault()}
            >
              {collectionMethodLabels[method]}
            </DropdownMenu.CheckboxItem>
          ))}
        </DropdownMenu.Group>
        <DropdownMenu.Label>{t({ en: 'Series', es: 'Serie', fr: 'Série' })}</DropdownMenu.Label>
        <DropdownMenu.Group>
          {Array.from(seriesOptions, ([id, name]) => (
            <DropdownMenu.CheckboxItem
              checked={selectedSeries.includes(id)}
              data-testid={`instrument-hub-filter-series-${id === NO_SERIES ? INDIVIDUAL_LABEL_KEY : id}`}
              key={id}
              onCheckedChange={(checked) => {
                setSeries(checked ? [...selectedSeries, id] : selectedSeries.filter((item) => item !== id));
              }}
              onSelect={(e) => e.preventDefault()}
            >
              {id === NO_SERIES ? t({ en: 'Individual', es: 'Individual', fr: 'Individuel' }) : (name ?? id)}
            </DropdownMenu.CheckboxItem>
          ))}
        </DropdownMenu.Group>
      </DropdownMenu.Content>
    </DropdownMenu>
  );
};

function useSeriesMemberRows(
  records: InstrumentVisualizationRecord[],
  infoById: { [id: string]: { edition: null | number; kind: InstrumentKind; title: string } }
) {
  return useMemo<InstrumentRow[]>(() => {
    const members = new Map<string, { lastCollectedAt: Date | null; subjectIds: Set<string>; total: number }>();
    for (const record of records) {
      let member = members.get(record.__instrumentId__);
      if (!member) {
        member = { lastCollectedAt: null, subjectIds: new Set(), total: 0 };
        members.set(record.__instrumentId__, member);
      }
      member.total += 1;
      member.subjectIds.add(record.__subjectId__);
      if (!member.lastCollectedAt || record.__date__ > member.lastCollectedAt) {
        member.lastCollectedAt = record.__date__;
      }
    }
    return Array.from(members, ([id, member]) => ({
      edition: infoById[id]?.edition ?? null,
      id,
      kind: infoById[id]?.kind ?? 'FORM',
      lastCollectedAt: member.lastCollectedAt,
      recordCount: member.total,
      source: null,
      subjectCount: member.subjectIds.size,
      title: infoById[id]?.title ?? id
    }));
  }, [records, infoById]);
}

const RouteComponent = () => {
  const navigate = Route.useNavigate();
  const { instrumentId: seriesInstrumentId } = Route.useParams();
  const [highlightedRowId, setHighlightedRowId] = useState<null | string>(null);
  const { dl, records } = useInstrumentHubRecords();
  const { editionOptions, isSeries, seriesOptions } = useInstrumentHubFacets();
  const instrumentInfoById = useInstrumentInfoById({ allEditions: true });
  const metadataColumns = useRecordMetadataColumns({ omitSeries: isSeries });
  const subjectIdDisplaySetting = useAppStore((store) => store.currentGroup?.settings.subjectIdDisplayLength);
  const search = Route.useSearch();

  const { t } = useTranslation();
  const seriesMembers = useSeriesMemberRows(records, instrumentInfoById);

  const measureColumns = useMemo<TanstackTable.ColumnDef<InstrumentVisualizationRecord>[]>(() => {
    const columns: TanstackTable.ColumnDef<InstrumentVisualizationRecord>[] = [];
    if (isSeries) {
      return [
        {
          accessorFn: (record) => instrumentInfoById[record.__instrumentId__]?.title ?? record.__instrumentId__,
          cell: (ctx) => {
            const title = ctx.getValue() as string;
            return <TruncatedCell data-testid="instrument-table-cell-instrument" title={title} value={title} />;
          },
          header: ({ column }) => <SortableHeader column={column} label="INSTRUMENT" />,
          id: '__instrument__'
        }
      ];
    }
    for (const key in records[0]) {
      if (!key.startsWith(FIXED_COLUMN_PREFIX)) {
        columns.push({
          accessorKey: key,
          cell: (ctx) => {
            const value = formatRecordValue(ctx.getValue());
            return <TruncatedCell data-testid={`instrument-table-cell-${key}`} title={String(value)} value={value} />;
          },
          header: ({ column }) => <SortableHeader column={column} label={camelToSnakeCase(key).toUpperCase()} />,
          id: key
        });
      }
    }
    return columns;
  }, [instrumentInfoById, isSeries, records[0]]);

  // Both subject destinations carry where they were opened from, so the subject hub's return comes
  // back to this record table rather than dropping the reader on the subject index.
  const fromHere = { fromInstrument: seriesInstrumentId, fromSeries: search.fromSeries };

  const viewRecord = (record: InstrumentVisualizationRecord) => {
    void navigate({
      params: { recordId: record.__id__, subjectId: record.__subjectId__ },
      search: fromHere,
      to: '/datahub/subjects/$subjectId/table/$recordId'
    });
  };

  if (isSeries) {
    return (
      <InstrumentTable
        data-testid="instrument-hub-series-members"
        recordExport={dl}
        rows={seriesMembers}
        onOpen={(row) => {
          void navigate({
            params: { instrumentId: row.id },
            // Narrowed to this series, not every record the member instrument ever collected: the
            // reader asked for the series' subjects, and the member's own page is reachable from
            // the hub index when they want the whole set.
            search: { fromSeries: seriesInstrumentId, series: [seriesInstrumentId] },
            to: '/datahub/instruments/$instrumentId/table'
          });
        }}
      />
    );
  }

  return (
    <div>
      <div className="mb-3">
        <div className="flex flex-col gap-2 lg:flex-row lg:justify-between">
          <div className="flex flex-col gap-2 lg:flex-row">
            <SelectEdition
              options={editionOptions}
              value={seriesInstrumentId}
              onSelect={(id) => {
                void navigate({ params: { instrumentId: id }, to: '/datahub/instruments/$instrumentId/table' });
              }}
            />
          </div>
          <div className="flex flex-col gap-2 lg:flex-row">
            <TimeDropdown
              setMinTime={(minDate) => {
                void navigate({ search: (prev) => ({ ...prev, minDate: minDate ?? undefined }) });
              }}
            />
            <Filters seriesOptions={seriesOptions} />
            <ActionDropdown
              data-spotlight-type="export-data-dropdown"
              data-testid="instrument-hub-export-dropdown"
              disabled={records.length === 0}
              options={['TSV', 'TSV Long', 'JSON', 'CSV', 'CSV Long', 'Excel', 'Excel Long']}
              title={t('core.download')}
              triggerClassName="min-w-32"
              onSelection={dl}
            />
          </div>
        </div>
      </div>
      <div data-testid="instrument-hub-records-table">
        <DataTable
          disableSearch
          columns={[
            {
              accessorKey: '__subjectId__',
              cell: (ctx) => (
                <span className="flex items-center">
                  {removeSubjectIdScope(ctx.getValue() as string).slice(0, subjectIdDisplaySetting ?? 9)}
                  <span
                    className="hidden"
                    data-row-selected={highlightedRowId === ctx.row.original.__id__ ? 'true' : 'false'}
                  />
                </span>
              ),
              header: ({ column }) => <SortableHeader column={column} label="SUBJECT" />,
              id: '__subjectId__'
            },
            {
              accessorKey: '__date__',
              cell: (ctx) => {
                const value = ctx.getValue();
                return value instanceof Date ? toBasicISOString(value) : value;
              },
              header: ({ column }) => <SortableHeader column={column} label="DATE_COLLECTED" />,
              id: '__date__'
            },
            ...metadataColumns,
            ...measureColumns
          ]}
          data={records}
          rowActions={[
            {
              label: t({ en: 'View Record', es: 'Ver registro', fr: "Voir l'enregistrement" }),
              onSelect: viewRecord
            },
            {
              label: t({ en: 'View Subject', es: 'Ver sujeto', fr: 'Voir le client' }),
              onSelect: (record) => {
                void navigate({
                  params: { subjectId: record.__subjectId__ },
                  search: fromHere,
                  to: '/datahub/subjects/$subjectId/table'
                });
              }
            }
          ]}
          onRowClick={(row) => setHighlightedRowId(row.__id__)}
          onRowDoubleClick={viewRecord}
        />
      </div>
    </div>
  );
};

export const Route = createFileRoute('/_app/datahub/instruments/$instrumentId/table')({
  component: RouteComponent
});
