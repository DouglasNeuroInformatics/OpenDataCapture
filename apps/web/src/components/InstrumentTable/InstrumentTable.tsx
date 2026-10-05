import { useMemo, useState } from 'react';

import { toBasicISOString } from '@douglasneuroinformatics/libjs';
import { ActionDropdown, Button, DataTable, DropdownMenu } from '@douglasneuroinformatics/libui/components';
import type { TanstackTable } from '@douglasneuroinformatics/libui/components';
import { useDownload, useNotificationsStore, useTheme, useTranslation } from '@douglasneuroinformatics/libui/hooks';
import { ChevronDownIcon } from 'lucide-react';
import { unparse } from 'papaparse';

import { ColorTagCell } from '@/components/ColorTagCell';
import { SortableHeader } from '@/components/SortableHeader';
import { TruncatedCell } from '@/components/TruncatedCell';
import { resolveTheme } from '@/utils/chart-theme';
import { downloadSubjectTableExcel } from '@/utils/excel';
import { getInstrumentKindColor } from '@/utils/tag-colors';

/** Shown where an instrument has no source repository, or has never been collected */
const EMPTY_CELL = '—';

const INSTRUMENT_KINDS = ['FORM', 'INTERACTIVE', 'FILE', 'SERIES'] as const;

type InstrumentRow = {
  edition: null | number;
  id: string;
  kind: string;
  lastCollectedAt: Date | null;
  recordCount: number;
  source: null | string;
  subjectCount: number;
  title: string;
};

type KindFilter = string[];

/** A kind tag, matching the treatment the subject table gives sex. */
const InstrumentKindCell = ({ kind }: { kind: string }) => {
  const [theme] = useTheme();
  const { t } = useTranslation();
  const labels: { [key: string]: string } = {
    FILE: t({ en: 'File', es: 'Archivo', fr: 'Fichier' }),
    FORM: t({ en: 'Form', es: 'Formulario', fr: 'Formulaire' }),
    INTERACTIVE: t({ en: 'Interactive', es: 'Interactivo', fr: 'Interactif' }),
    SERIES: t({ en: 'Series', es: 'Serie', fr: 'Série' })
  };
  return (
    <ColorTagCell
      color={getInstrumentKindColor(kind, resolveTheme(theme))}
      data-testid="instrument-cell-kind"
      label={labels[kind] ?? kind}
    />
  );
};

/**
 * The toolbar every instrument listing shares: filter by kind and by whether anything was ever
 * collected, then export exactly the rows left on screen.
 */
const Toolbar = ({ rows, table }: { rows: InstrumentRow[]; table: TanstackTable.Table<InstrumentRow> }) => {
  const { t } = useTranslation();
  const download = useDownload();
  const addNotification = useNotificationsStore((store) => store.addNotification);
  const [isOpen, setIsOpen] = useState(false);

  const kindColumn = table.getAllColumns().find((column) => column.id === 'kind');
  const kindFilter = (kindColumn?.getFilterValue() ?? []) as KindFilter;
  const recordColumn = table.getAllColumns().find((column) => column.id === 'recordCount');
  const withRecordsOnly = (recordColumn?.getFilterValue() as boolean | undefined) ?? false;

  /** Export what the table is listing, so a filtered view and its download agree. */
  const listed = useMemo(() => {
    const visible = new Set(table.getFilteredRowModel().rows.map((row) => row.original.id));
    return rows.filter((row) => visible.has(row.id));
  }, [rows, table.getFilteredRowModel().rows]);

  const handleExport = (option: 'CSV' | 'Excel' | 'JSON') => {
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
    const exported = listed.map((row) => ({
      Edition: row.edition ?? '',
      Instrument: row.title,
      Kind: row.kind,
      LastCollected: row.lastCollectedAt ? toBasicISOString(row.lastCollectedAt) : '',
      Records: row.recordCount,
      Source: row.source ?? 'manual',
      Subjects: row.subjectCount
    }));
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
                {kind}
              </DropdownMenu.CheckboxItem>
            ))}
          </DropdownMenu.Group>
          <DropdownMenu.Label>{t({ en: 'Records', es: 'Registros', fr: 'Enregistrements' })}</DropdownMenu.Label>
          <DropdownMenu.Group>
            <DropdownMenu.CheckboxItem
              checked={withRecordsOnly}
              data-testid="instrument-table-filter-has-records"
              onCheckedChange={(checked) => recordColumn?.setFilterValue(checked)}
              onSelect={(e) => e.preventDefault()}
            >
              {t({ en: 'Collected only', es: 'Solo con registros', fr: 'Avec enregistrements' })}
            </DropdownMenu.CheckboxItem>
          </DropdownMenu.Group>
        </DropdownMenu.Content>
      </DropdownMenu>
      <ActionDropdown
        widthFull
        align="end"
        className="font-medium"
        data-testid="instrument-table-export-dropdown"
        options={['CSV', 'JSON', 'Excel']}
        title={t('datahub.index.table.export')}
        onSelection={handleExport}
      />
    </div>
  );
};

type InstrumentTableProps = {
  'data-testid'?: string;
  onOpen: (row: InstrumentRow) => void;
  rowActions?: { label: string; onSelect: (row: InstrumentRow) => void }[];
  rows: InstrumentRow[];
};

/**
 * The instrument listing, shared by the hub's index and by a series' own page so the two read the
 * same way: same columns, same sort affordances, same search, filters and export.
 */
export const InstrumentTable = ({ 'data-testid': testId, onOpen, rowActions = [], rows }: InstrumentTableProps) => {
  const { t } = useTranslation();
  const [highlightedRowId, setHighlightedRowId] = useState<null | string>(null);

  const ToolbarWithRows = useMemo(() => {
    const Component = (props: { table: TanstackTable.Table<InstrumentRow> }) => <Toolbar {...props} rows={rows} />;
    Component.displayName = 'InstrumentTableToolbar';
    return Component;
  }, [rows]);

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
            // Carries the "collected only" filter: the value is a boolean, not a count to match.
            filterFn: (row, id, onlyCollected: boolean) => !onlyCollected || row.getValue<number>(id) > 0,
            header: ({ column }) => (
              <SortableHeader column={column} label={t({ en: 'Records', es: 'Registros', fr: 'Enregistrements' })} />
            )
          },
          {
            accessorKey: 'lastCollectedAt',
            cell: (ctx) => {
              const value = ctx.getValue() as Date | null;
              return value ? toBasicISOString(value) : EMPTY_CELL;
            },
            header: ({ column }) => (
              <SortableHeader
                column={column}
                label={t({ en: 'Last Collected', es: 'Última recopilación', fr: 'Dernière collecte' })}
              />
            )
          },
          {
            accessorKey: 'kind',
            cell: (ctx) => <InstrumentKindCell kind={ctx.getValue() as string} />,
            filterFn: (row, id, filter: KindFilter) => filter.includes(row.getValue(id)),
            header: ({ column }) => (
              <SortableHeader column={column} label={t({ en: 'Kind', es: 'Tipo', fr: 'Type' })} />
            ),
            id: 'kind'
          },
          {
            accessorKey: 'edition',
            cell: (ctx) => (ctx.getValue() as null | number) ?? EMPTY_CELL,
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
            { id: 'recordCount', value: false }
          ]
        }}
        rowActions={[{ label: t('common.view'), onSelect: onOpen }, ...rowActions]}
        togglesComponent={ToolbarWithRows}
        onRowClick={(row) => setHighlightedRowId(row.id)}
        onRowDoubleClick={onOpen}
      />
    </div>
  );
};

export type { InstrumentRow };
