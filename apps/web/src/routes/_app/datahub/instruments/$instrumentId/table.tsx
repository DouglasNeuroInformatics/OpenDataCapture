import { useMemo, useState } from 'react';

import { camelToSnakeCase, toBasicISOString } from '@douglasneuroinformatics/libjs';
import { ActionDropdown, DataTable, TanstackTable } from '@douglasneuroinformatics/libui/components';
import { useTranslation } from '@douglasneuroinformatics/libui/hooks';
import type { InstrumentKind } from '@opendatacapture/runtime-core';
import { removeSubjectIdScope } from '@opendatacapture/subject-utils';
import { createFileRoute, useNavigate } from '@tanstack/react-router';

import { InstrumentTable } from '@/components/InstrumentTable';
import type { InstrumentRow } from '@/components/InstrumentTable';
import { TruncatedCell } from '@/components/TruncatedCell';
import { useInstrumentHubFacets } from '@/hooks/useInstrumentHubFacets';
import { useInstrumentHubRecords } from '@/hooks/useInstrumentHubRecords';
import { useInstrumentInfoById } from '@/hooks/useInstrumentInfoById';
import type { InstrumentVisualizationRecord } from '@/hooks/useInstrumentVisualization';
import { useRecordMetadataColumns } from '@/hooks/useRecordMetadataColumns';
import { useAppStore } from '@/store';
import { formatRecordValue } from '@/utils/record-value';

/** The record fields rendered as fixed columns rather than as the instrument's own measures */
const FIXED_COLUMN_PREFIX = '__';

/**
 * The instruments a series is made of, counted from the records that series orchestrated.
 *
 * Deliberately derived from the already-loaded records rather than fetched: these totals have to be
 * what this series collected, not the instrument's global ones, which is what a per-instrument
 * summary would give.
 */
function useSeriesMemberRows(
  records: InstrumentVisualizationRecord[],
  infoById: { [id: string]: { kind: InstrumentKind; title: string } }
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
      edition: null,
      id,
      // A series composes scalar instruments of any kind, so the member's own kind is carried
      // through rather than assumed — a FILE or INTERACTIVE member is not a form.
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
  const navigate = useNavigate();
  const [highlightedRowId, setHighlightedRowId] = useState<null | string>(null);
  const { dl, records } = useInstrumentHubRecords();
  const { isSeries } = useInstrumentHubFacets();
  const instrumentInfoById = useInstrumentInfoById({ allEditions: true });
  const metadataColumns = useRecordMetadataColumns({ omitSeries: isSeries });
  const subjectIdDisplaySetting = useAppStore((store) => store.currentGroup?.settings.subjectIdDisplayLength);

  const { t } = useTranslation();
  const seriesMembers = useSeriesMemberRows(records, instrumentInfoById);

  const measureColumns = useMemo<TanstackTable.ColumnDef<InstrumentVisualizationRecord>[]>(() => {
    const columns: TanstackTable.ColumnDef<InstrumentVisualizationRecord>[] = [];
    // A series spans instruments whose measures have nothing in common, so a shared measure column
    // would be empty for most rows. It names the instrument each record came from instead.
    if (isSeries) {
      return [
        {
          accessorFn: (record) => instrumentInfoById[record.__instrumentId__]?.title ?? record.__instrumentId__,
          cell: (ctx) => {
            const title = ctx.getValue() as string;
            return <TruncatedCell data-testid="instrument-table-cell-instrument" title={title} value={title} />;
          },
          header: 'INSTRUMENT',
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
          header: camelToSnakeCase(key).toUpperCase(),
          id: key
        });
      }
    }
    return columns;
  }, [instrumentInfoById, isSeries, records[0]]);

  const viewRecord = (record: InstrumentVisualizationRecord) => {
    void navigate({
      params: { recordId: record.__id__, subjectId: record.__subjectId__ },
      to: '/datahub/subjects/$subjectId/table/$recordId'
    });
  };

  // A series lists what it is made of, and opening a member goes to that instrument's own page —
  // where its subjects and records read exactly as any other instrument's do.
  if (isSeries) {
    return (
      <InstrumentTable
        data-testid="instrument-hub-series-members"
        rows={seriesMembers}
        onOpen={(row) => {
          void navigate({ params: { instrumentId: row.id }, to: '/datahub/instruments/$instrumentId/table' });
        }}
      />
    );
  }

  return (
    <div>
      <div className="mb-3 flex justify-end">
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
              header: 'SUBJECT',
              id: '__subjectId__'
            },
            {
              accessorKey: '__date__',
              cell: (ctx) => {
                const value = ctx.getValue();
                return value instanceof Date ? toBasicISOString(value) : value;
              },
              header: 'DATE_COLLECTED'
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
                  to: '/datahub/subjects/$subjectId/table'
                });
              }
            }
          ]}
          // libui gates the row hover highlight on the presence of `onRowClick`, so recording the
          // clicked row is what turns it on — the same thing the subject table already does.
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
