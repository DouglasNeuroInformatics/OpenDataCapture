import React, { useMemo, useState } from 'react';

import { toBasicISOString } from '@douglasneuroinformatics/libjs';
import { Button, DataTable, DropdownMenu } from '@douglasneuroinformatics/libui/components';
import type { TanstackTable } from '@douglasneuroinformatics/libui/components';
import { useDownload, useNotificationsStore, useTheme, useTranslation } from '@douglasneuroinformatics/libui/hooks';
import type { InstrumentKind } from '@opendatacapture/runtime-core';
import { ChevronDownIcon } from 'lucide-react';
import { unparse } from 'papaparse';

import { CollectedFilterMenu } from '@/components/CollectedFilterMenu';
import { ColorTagCell } from '@/components/ColorTagCell';
import { InstrumentPreviewDialog } from '@/components/InstrumentPreviewDialog';
import type { InstrumentPreviewItem } from '@/components/InstrumentPreviewDialog';
import { SortableHeader } from '@/components/SortableHeader';
import { TruncatedCell } from '@/components/TruncatedCell';
import { useInstrumentInfoQuery } from '@/hooks/useInstrumentInfoQuery';
import { useInstrumentKindLabels } from '@/hooks/useInstrumentKindLabels';
import { resolveTheme } from '@/utils/chart-theme';
import { DEFAULT_COLLECTED_FILTER, matchesCollectedFilter } from '@/utils/collected-filter';
import type { CollectedFilter } from '@/utils/collected-filter';
import { downloadSubjectTableExcel } from '@/utils/excel';
import { getInstrumentKindColor } from '@/utils/tag-colors';

/** Listed in the order a reader is most likely to meet them, not the enum's own order. */
const INSTRUMENT_KINDS = ['FORM', 'INTERACTIVE', 'FILE', 'SERIES'] as const satisfies readonly InstrumentKind[];

const LISTING_FORMATS = ['CSV', 'JSON', 'Excel'] as const;

/**
 * Both shapes of each format. Wide carries every instrument's measures as columns, so a record
 * leaves blank whatever its own instrument does not measure; long carries one row per measured
 * value instead, which stays narrow however many instruments the series spans.
 */
const RECORD_FORMATS = [
  { label: 'TSV', option: 'TSV' },
  { label: 'TSV Long', option: 'TSV Long' },
  { label: 'JSON', option: 'JSON' },
  { label: 'CSV', option: 'CSV' },
  { label: 'CSV Long', option: 'CSV Long' },
  { label: 'Excel', option: 'Excel' },
  { label: 'Excel Long', option: 'Excel Long' }
] as const satisfies readonly { label: string; option: RecordExportOption }[];

/** The formats a record export offers, matching the set every other record table already offers */
type RecordExportOption = 'CSV' | 'CSV Long' | 'Excel' | 'Excel Long' | 'JSON' | 'TSV' | 'TSV Long';

type InstrumentRow = {
  edition: null | number;
  id: string;
  kind: InstrumentKind;
  lastCollectedAt: Date | null;
  recordCount: number;
  source: null | string;
  subjectCount: number;
  title: string;
};

type KindFilter = InstrumentKind[];

/** A kind tag, matching the treatment the subject table gives sex. */
const InstrumentKindCell = ({ kind }: { kind: InstrumentKind }) => {
  const [theme] = useTheme();
  const labels = useInstrumentKindLabels();
  return (
    <ColorTagCell
      color={getInstrumentKindColor(kind, resolveTheme(theme))}
      data-testid="instrument-cell-kind"
      label={labels[kind]}
    />
  );
};

/**
 * The toolbar every instrument listing shares: filter by kind and by how much was collected, then
 * export exactly the rows left on screen.
 */
const Toolbar = ({
  recordExport,
  rows,
  table
}: {
  recordExport?: (option: RecordExportOption) => void;
  rows: InstrumentRow[];
  table: TanstackTable.Table<InstrumentRow>;
}) => {
  const { t } = useTranslation();
  const download = useDownload();
  const addNotification = useNotificationsStore((store) => store.addNotification);
  const kindLabels = useInstrumentKindLabels();
  const [isOpen, setIsOpen] = useState(false);
  // Held as the raw string: coercing to a number on every keystroke re-seeded a `0` the moment the
  // field was cleared, so typed digits landed after it instead of replacing it.
  const [minRecords, setMinRecords] = useState('');

  const kindColumn = table.getAllColumns().find((column) => column.id === 'kind');
  const kindFilter = (kindColumn?.getFilterValue() ?? []) as KindFilter;
  const recordColumn = table.getAllColumns().find((column) => column.id === 'recordCount');
  const collectedColumn = table.getAllColumns().find((column) => column.id === 'lastCollectedAt');
  const collectedFilter = (collectedColumn?.getFilterValue() ?? DEFAULT_COLLECTED_FILTER) as CollectedFilter;

  /** Export what the table is listing, so a filtered view and its download agree. */
  const listed = useMemo(() => {
    const visible = new Set(table.getFilteredRowModel().rows.map((row) => row.original.id));
    return rows.filter((row) => visible.has(row.id));
  }, [rows, table.getFilteredRowModel().rows]);

  const handleExport = (option: (typeof LISTING_FORMATS)[number]) => {
    if (listed.length === 0) {
      addNotification({
        message: t({
          en: 'There is nothing to export',
          es: 'No hay nada que exportar',
          fr: "Il n'y a rien à exporter"
        }),
        type: 'error'
      });
      return;
    }
    // Built imperatively, in the order the table shows these columns: the key order is the header
    // order, and `perfectionist/sort-objects` would alphabetize an object literal into a different
    // one than the reader just looked at.
    const exported = listed.map((row) => {
      const exportedRow: { [key: string]: unknown } = {};
      exportedRow.Instrument = row.title;
      exportedRow.Subjects = row.subjectCount;
      exportedRow.Records = row.recordCount;
      exportedRow.LastCollected = row.lastCollectedAt ? toBasicISOString(row.lastCollectedAt) : 'None';
      exportedRow.Kind = row.kind;
      exportedRow.Edition = row.edition ?? 'None';
      exportedRow.Source = row.source ?? 'manual';
      return exportedRow;
    });
    const filename = `instruments_${new Date().toISOString()}`;
    switch (option) {
      case 'CSV':
        void download(`${filename}.csv`, () => unparse(exported));
        break;
      case 'Excel':
        downloadSubjectTableExcel(`${filename}.xlsx`, exported, 'Instruments');
        break;
      case 'JSON':
        void download(`${filename}.json`, () => JSON.stringify(exported, null, 2));
        break;
    }
  };

  return (
    <div className="flex gap-3">
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenu.Trigger asChild>
          <Button
            className="flex items-center justify-between gap-2"
            data-testid="instrument-table-filters-trigger"
            variant="outline"
          >
            {t('common.filters')}
            <ChevronDownIcon className="opacity-50" />
          </Button>
        </DropdownMenu.Trigger>
        <DropdownMenu.Content align="end" className="w-56">
          <DropdownMenu.Label>{t({ en: 'Kind', es: 'Tipo', fr: 'Type' })}</DropdownMenu.Label>
          <DropdownMenu.Group>
            {INSTRUMENT_KINDS.map((kind) => (
              <DropdownMenu.CheckboxItem
                checked={kindFilter.includes(kind)}
                data-testid={`instrument-table-filter-kind-${kind}`}
                key={kind}
                onCheckedChange={(checked) => {
                  kindColumn?.setFilterValue((previous: KindFilter) =>
                    checked ? [...previous, kind] : previous.filter((item) => item !== kind)
                  );
                }}
                onSelect={(e) => e.preventDefault()}
              >
                {kindLabels[kind]}
              </DropdownMenu.CheckboxItem>
            ))}
          </DropdownMenu.Group>
          <DropdownMenu.Label>{t({ en: 'Records', es: 'Registros', fr: 'Enregistrements' })}</DropdownMenu.Label>
          <DropdownMenu.Group>
            <div className="relative flex items-center justify-between gap-1 rounded-xs px-2 pt-1.5 pb-1 text-sm transition-colors">
              <span className="pb-1">{t({ en: 'At least:', es: 'Al menos:', fr: 'Au moins :' })}</span>
              <input
                className="bg-popover text-foreground pointer-events-auto w-16 rounded-sm border-b pb-0.5"
                data-testid="instrument-table-filter-min-records"
                min={0}
                placeholder={t({ en: 'Any', es: 'Cualquiera', fr: 'Tous' })}
                type="number"
                value={minRecords}
                onChange={(event) => {
                  setMinRecords(event.target.value);
                  // An empty field means no minimum, which is why the parse falls back to zero.
                  recordColumn?.setFilterValue(Number.parseInt(event.target.value, 10) || 0);
                }}
              />
            </div>
            <CollectedFilterMenu
              testIdPrefix="instrument-table-filter"
              value={collectedFilter}
              onChange={(next) => collectedColumn?.setFilterValue(next)}
            />
          </DropdownMenu.Group>
        </DropdownMenu.Content>
      </DropdownMenu>
      <DropdownMenu>
        <DropdownMenu.Trigger asChild>
          <Button
            className="flex items-center justify-between gap-2 font-medium"
            data-testid="instrument-table-export-dropdown"
            variant="outline"
          >
            {t('core.download')}
            <ChevronDownIcon className="opacity-50" />
          </Button>
        </DropdownMenu.Trigger>
        <DropdownMenu.Content align="end" className="w-56">
          {/* A heading earns its place only once there is a second section to tell apart from the
              first; over one list of formats it says nothing the button did not already say. */}
          {recordExport && (
            <DropdownMenu.Label>
              {t({ en: 'Instrument list', es: 'Lista de instrumentos', fr: 'Liste des instruments' })}
            </DropdownMenu.Label>
          )}
          <DropdownMenu.Group>
            {LISTING_FORMATS.map((format) => (
              <DropdownMenu.Item
                data-testid={`instrument-table-export-listing-${format}`}
                key={format}
                onSelect={() => handleExport(format)}
              >
                {format}
              </DropdownMenu.Item>
            ))}
          </DropdownMenu.Group>
          {recordExport && (
            <React.Fragment>
              <DropdownMenu.Separator />
              <DropdownMenu.Label>
                {t({ en: 'Subject data', es: 'Datos de sujetos', fr: 'Données des clients' })}
              </DropdownMenu.Label>
              <DropdownMenu.Group>
                {RECORD_FORMATS.map(({ label, option }) => (
                  <DropdownMenu.Item
                    data-testid={`instrument-table-export-records-${label}`}
                    key={label}
                    onSelect={() => recordExport(option)}
                  >
                    {label}
                  </DropdownMenu.Item>
                ))}
              </DropdownMenu.Group>
            </React.Fragment>
          )}
        </DropdownMenu.Content>
      </DropdownMenu>
    </div>
  );
};

type InstrumentTableProps = {
  'data-testid'?: string;
  onOpen: (row: InstrumentRow) => void;
  /**
   * Offered as a second export section, for the records behind the listing rather than the listing
   * itself. Supplied only where those records are one coherent set — a series' own page — and
   * omitted by the hub index, whose rows share nothing a single file could describe.
   */
  recordExport?: (option: RecordExportOption) => void;
  rows: InstrumentRow[];
};

/**
 * The instrument listing, shared by the hub's index and by a series' own page so the two read the
 * same way: same columns, same sort affordances, same search, filters and export.
 */
export const InstrumentTable = ({ 'data-testid': testId, onOpen, recordExport, rows }: InstrumentTableProps) => {
  const { t } = useTranslation();
  const [highlightedRowId, setHighlightedRowId] = useState<null | string>(null);
  const [preview, setPreview] = useState<InstrumentPreviewItem | null>(null);

  // Every edition, so a row naming an older one previews that one rather than the current version.
  const instrumentInfoQuery = useInstrumentInfoQuery({ params: { allEditions: true } });
  const infoById = useMemo(
    () => new Map((instrumentInfoQuery.data ?? []).map((info) => [info.id, info])),
    [instrumentInfoQuery.data]
  );

  /** The shape the shared preview dialog takes, filled from the catalog the row only names by id. */
  const toPreviewItem = (row: InstrumentRow): InstrumentPreviewItem => {
    const info = infoById.get(row.id);
    return {
      authors: info?.details.authors ?? null,
      availability: null,
      createdAt: info?.createdAt ?? null,
      description: info?.details.description,
      id: row.id,
      internal: info && info.kind !== 'SERIES' ? info.internal : null,
      kind: row.kind,
      seriesItems: info?.kind === 'SERIES' ? info.seriesItems : undefined,
      source: row.source === null ? { kind: 'manual' } : { kind: 'repo', name: row.source },
      title: row.title
    };
  };

  /** Consulted only to name a series' children, which are instruments this catalog also holds. */
  const previewableItems = useMemo(
    () => (instrumentInfoQuery.data ?? []).map((info) => ({ id: info.id, title: info.details.title })),
    [instrumentInfoQuery.data]
  );

  const ToolbarWithRows = useMemo(() => {
    const Component = (props: { table: TanstackTable.Table<InstrumentRow> }) => (
      <Toolbar {...props} recordExport={recordExport} rows={rows} />
    );
    Component.displayName = 'InstrumentTableToolbar';
    return Component;
  }, [recordExport, rows]);

  return (
    <div className="flex grow flex-col" data-testid={testId}>
      <DataTable
        // A middle column's width is (container - pinned) / the cap below, so a lower cap makes each
        // one wider and lets the row scroll rather than squeezing five columns into whatever the
        // pinned title leaves. The caps keep KIND wide enough for "Interactive" beside its dot.
        columnBreakpoints={{ 0: 1, 512: 1, 768: 2, 1024: 3, 1280: 5 }}
        columns={[
          {
            accessorKey: 'title',
            // The one genuinely long value in the row, so it clips to a line and offers the whole
            // title on hover rather than wrapping every row taller.
            cell: (ctx) => {
              const title = ctx.getValue() as string;
              return (
                <TruncatedCell
                  title={title}
                  value={
                    <>
                      {title}
                      <span
                        className="hidden"
                        data-row-selected={highlightedRowId === ctx.row.original.id ? 'true' : 'false'}
                      />
                    </>
                  }
                />
              );
            },
            header: ({ column }) => (
              <SortableHeader column={column} label={t({ en: 'Instrument', es: 'Instrumento', fr: 'Instrument' })} />
            ),
            // `size` is honoured only for a pinned column: `calculateColumnSizing` overwrites every
            // unpinned one with an equal share of the remaining width.
            size: 420
          },
          {
            accessorKey: 'subjectCount',
            header: ({ column }) => (
              <SortableHeader column={column} label={t({ en: 'Subjects', es: 'Sujetos', fr: 'Clients' })} />
            )
          },
          {
            accessorKey: 'recordCount',
            // Carries the minimum-records filter: the value is the floor a row must reach, not a
            // count to match. Zero admits everything, which is what an empty field means.
            filterFn: (row, id, minimum: number) => row.getValue<number>(id) >= minimum,
            header: ({ column }) => (
              <SortableHeader column={column} label={t({ en: 'Records', es: 'Registros', fr: 'Enregistrements' })} />
            )
          },
          {
            accessorKey: 'lastCollectedAt',
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
          },
          {
            accessorKey: 'kind',
            cell: (ctx) => <InstrumentKindCell kind={ctx.getValue() as InstrumentKind} />,
            filterFn: (row, id, filter: KindFilter) => filter.includes(row.getValue(id)),
            header: ({ column }) => (
              <SortableHeader column={column} label={t({ en: 'Kind', es: 'Tipo', fr: 'Type' })} />
            ),
            id: 'kind'
          },
          {
            accessorKey: 'edition',
            cell: (ctx) => (ctx.getValue() as null | number) ?? t({ en: 'None', es: 'Ninguno', fr: 'Aucun' }),
            header: ({ column }) => (
              <SortableHeader column={column} label={t({ en: 'Edition', es: 'Edición', fr: 'Édition' })} />
            )
          },
          {
            accessorKey: 'source',
            cell: (ctx) => {
              const source =
                (ctx.getValue() as null | string) ??
                t({ en: 'Manual upload', es: 'Carga manual', fr: 'Téléversement manuel' });
              return <TruncatedCell title={source} value={source} />;
            },
            header: ({ column }) => (
              <SortableHeader column={column} label={t({ en: 'Source', es: 'Origen', fr: 'Source' })} />
            )
          }
        ]}
        data={rows}
        initialState={{
          columnPinning: { left: ['title'] },
          // eslint-disable-next-line perfectionist/sort-objects
          columnFilters: [
            { id: 'kind', value: [...INSTRUMENT_KINDS] satisfies KindFilter },
            { id: 'recordCount', value: 0 },
            { id: 'lastCollectedAt', value: DEFAULT_COLLECTED_FILTER }
          ]
        }}
        rowActions={[
          { label: t('common.view'), onSelect: onOpen },
          {
            label: t({ en: 'Preview', es: 'Vista previa', fr: 'Aperçu' }),
            onSelect: (row) => setPreview(toPreviewItem(row))
          }
        ]}
        togglesComponent={ToolbarWithRows}
        onRowClick={(row) => setHighlightedRowId(row.id)}
        onRowDoubleClick={onOpen}
      />
      {preview && <InstrumentPreviewDialog item={preview} items={previewableItems} onClose={() => setPreview(null)} />}
    </div>
  );
};

export type { InstrumentRow };
