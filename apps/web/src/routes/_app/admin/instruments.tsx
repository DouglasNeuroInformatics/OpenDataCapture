import { useState } from 'react';
import type { ComponentProps } from 'react';

import { toBasicISOString } from '@douglasneuroinformatics/libjs';
import { Button, DataTable, Dialog, Heading } from '@douglasneuroinformatics/libui/components';
import { useTranslation } from '@douglasneuroinformatics/libui/hooks';
import { cn } from '@douglasneuroinformatics/libui/utils';
import { translateInstrumentInfo } from '@opendatacapture/instrument-utils';
import type { InstrumentInfo, TranslatedInstrumentInfo } from '@opendatacapture/schemas/instrument';
import { createFileRoute } from '@tanstack/react-router';

import { InstrumentPreviewDialog } from '@/components/InstrumentPreviewDialog';
import type { InstrumentPreviewItem, InstrumentSource } from '@/components/InstrumentPreviewDialog';
import { PageHeader } from '@/components/PageHeader';
import { groupsQueryOptions, useGroupsQuery } from '@/hooks/useGroupsQuery';
import { useInstrumentInfoQuery } from '@/hooks/useInstrumentInfoQuery';
import {
  seriesInstrumentsOverviewQueryOptions,
  useSeriesInstrumentsOverviewQuery
} from '@/hooks/useSeriesInstrumentsOverviewQuery';
import { useUpdateSeriesInstrumentArchiveMutation } from '@/hooks/useUpdateSeriesInstrumentArchiveMutation';
import { $AdminInstrumentsSearch } from '@/utils/admin-instruments-search';
import { selectLatestEditions } from '@/utils/instrument-editions';
import { sortSeriesOverviewRows } from '@/utils/series-overview';
import type { SeriesOverviewRow } from '@/utils/series-overview';

type SeriesRow = SeriesOverviewRow & {
  createdAt: Date | null;
  id: string;
  preview: InstrumentPreviewItem;
};

/** One line cut off with an ellipsis, with the whole text shown on hover. */
const CellText = ({ className, text, ...props }: ComponentProps<'span'> & { text: string }) => (
  <span className={cn('block min-w-0 truncate', className)} title={text} {...props}>
    {text}
  </span>
);

const ArchiveDialog = ({ onClose, row }: { onClose: () => void; row: SeriesRow }) => {
  const { t } = useTranslation();
  const archiveMutation = useUpdateSeriesInstrumentArchiveMutation();
  const groupLabel = row.groupName ?? t({ en: 'All groups', es: 'Todos los grupos', fr: 'Tous les groupes' });

  return (
    <Dialog open onOpenChange={onClose}>
      <Dialog.Content className="sm:max-w-[500px]" data-testid="archive-series-dialog">
        <Dialog.Header>
          <Dialog.Title>
            {t({
              en: 'Archive Series Instrument',
              es: 'Archivar serie de instrumentos',
              fr: 'Archiver l’instrument en série'
            })}
          </Dialog.Title>
          <Dialog.Description>
            {t({
              en: `"${row.title}" (${groupLabel}) will no longer be offered for new sessions or remote assignments. Data already collected with it, and remote assignments still outstanding, are not affected. You can unarchive it at any time.`,
              es: `"${row.title}" (${groupLabel}) dejará de ofrecerse para nuevas sesiones o tareas remotas. Los datos ya recopilados y las tareas remotas pendientes no se verán afectados. Puede desarchivarlo en cualquier momento.`,
              fr: `« ${row.title} » (${groupLabel}) ne sera plus proposé pour de nouvelles sessions ou tâches à distance. Les données déjà recueillies et les tâches à distance en cours ne sont pas affectées. Vous pouvez le désarchiver à tout moment.`
            })}
          </Dialog.Description>
        </Dialog.Header>
        <Dialog.Footer>
          <Button type="button" variant="outline" onClick={onClose}>
            {t({ en: 'Cancel', es: 'Cancelar', fr: 'Annuler' })}
          </Button>
          <Button
            data-testid="confirm-archive-series"
            disabled={archiveMutation.isPending}
            type="button"
            variant="danger"
            onClick={() => archiveMutation.mutate({ id: row.id, isArchived: true }, { onSettled: onClose })}
          >
            {t('common.archive')}
          </Button>
        </Dialog.Footer>
      </Dialog.Content>
    </Dialog>
  );
};

type InstrumentRow = {
  createdAt: Date | null;
  edition: number;
  groupNames: string[];
  id: string;
  kind: string;
  preview: InstrumentPreviewItem;
  sourceLabel: string;
  title: string;
};

type InstrumentViewProps = {
  // Every scalar instrument, of every edition, so a series' items can be named in its preview.
  scalarInstruments: Exclude<TranslatedInstrumentInfo, { kind: 'SERIES' }>[];
};

const useInstrumentSource = () => {
  const { t } = useTranslation();
  return (sourceRepo: InstrumentInfo['sourceRepo']): InstrumentSource =>
    sourceRepo
      ? {
          kind: 'repo',
          name: sourceRepo.name ?? t({ en: 'Unknown repository', es: 'Repositorio desconocido', fr: 'Dépôt inconnu' })
        }
      : { kind: 'manual' };
};

const FormInstrumentsView = ({ scalarInstruments }: InstrumentViewProps) => {
  const { t } = useTranslation();
  const groupsQuery = useGroupsQuery();
  const toSource = useInstrumentSource();
  const [previewItem, setPreviewItem] = useState<InstrumentPreviewItem | null>(null);

  const rows: InstrumentRow[] = selectLatestEditions(scalarInstruments)
    .map((info) => {
      const source = toSource(info.sourceRepo);
      return {
        createdAt: info.createdAt ?? null,
        edition: info.internal.edition,
        groupNames: groupsQuery.data
          .filter((group) => group.accessibleInstrumentIds.includes(info.id))
          .map((group) => group.name),
        id: info.id,
        kind: info.kind,
        preview: {
          authors: info.details.authors,
          availability: null,
          createdAt: info.createdAt ?? null,
          description: info.details.description,
          id: info.id,
          internal: info.internal,
          kind: info.kind,
          source,
          title: info.details.title
        },
        sourceLabel: source.kind === 'repo' ? source.name : t({ en: 'Manual', es: 'Manual', fr: 'Manuel' }),
        title: info.details.title
      };
    })
    .toSorted((a, b) => a.title.localeCompare(b.title));

  return (
    <>
      <DataTable
        columns={[
          {
            accessorKey: 'title',
            cell: (ctx) => <CellText text={ctx.getValue<string>()} />,
            header: t({ en: 'Name', es: 'Nombre', fr: 'Nom' })
          },
          {
            accessorKey: 'sourceLabel',
            cell: (ctx) => <CellText text={ctx.getValue<string>()} />,
            header: t({ en: 'Source', es: 'Origen', fr: 'Source' })
          },
          {
            accessorFn: (row: InstrumentRow) =>
              row.groupNames.length > 0 ? row.groupNames.join(', ') : t({ en: 'None', es: 'Ninguno', fr: 'Aucun' }),
            cell: (ctx) => <CellText text={ctx.getValue<string>()} />,
            header: t({ en: 'Groups Using It', es: 'Grupos que lo usan', fr: 'Groupes qui l’utilisent' }),
            id: 'groups'
          },
          {
            accessorFn: (row: InstrumentRow) =>
              row.kind === 'INTERACTIVE'
                ? t({ en: 'Interactive', es: 'Interactivo', fr: 'Interactif' })
                : row.kind === 'FILE'
                  ? t({ en: 'File', es: 'Archivo', fr: 'Fichier' })
                  : t({ en: 'Form', es: 'Formulario', fr: 'Formulaire' }),
            cell: (ctx) => <CellText text={ctx.getValue<string>()} />,
            header: t({ en: 'Kind', es: 'Tipo', fr: 'Type' }),
            id: 'kind',
            size: 130
          },
          {
            accessorKey: 'edition',
            cell: (ctx) => <CellText text={String(ctx.getValue<number>())} />,
            header: t({ en: 'Edition', es: 'Edición', fr: 'Édition' }),
            size: 100
          },
          {
            accessorFn: (row: InstrumentRow) => (row.createdAt ? toBasicISOString(row.createdAt) : '-'),
            cell: (ctx) => <CellText text={ctx.getValue<string>()} />,
            header: t({ en: 'Added', es: 'Agregado', fr: 'Ajouté' }),
            id: 'createdAt',
            size: 130
          }
        ]}
        data={rows}
        emptyStateProps={{
          title: t({
            en: 'No instruments have been added yet.',
            es: 'Aún no se ha agregado ningún instrumento.',
            fr: 'Aucun instrument n’a encore été ajouté.'
          })
        }}
        // libui shares the width evenly between unpinned columns and honours `size` only on pinned ones,
        // so the short columns are pinned to leave the name the most room.
        initialState={{ columnPinning: { right: ['kind', 'edition', 'createdAt'] } }}
        rowActions={[
          {
            label: t({ en: 'Preview', es: 'Vista previa', fr: 'Aperçu' }),
            onSelect: (row: InstrumentRow) => setPreviewItem(row.preview)
          }
        ]}
        // libui applies its row hover highlight only when a click handler is set; a single click does nothing here.
        onRowClick={() => undefined}
        onRowDoubleClick={(row) => setPreviewItem(row.preview)}
      />
      {previewItem && (
        <InstrumentPreviewDialog
          item={previewItem}
          items={scalarInstruments.map((info) => ({ id: info.id, title: info.details.title }))}
          onClose={() => setPreviewItem(null)}
        />
      )}
    </>
  );
};

const SeriesInstrumentsView = ({ scalarInstruments }: InstrumentViewProps) => {
  const { resolvedLanguage, t } = useTranslation();
  const overviewQuery = useSeriesInstrumentsOverviewQuery();
  const unarchiveMutation = useUpdateSeriesInstrumentArchiveMutation();
  const toSource = useInstrumentSource();
  const [rowToArchive, setRowToArchive] = useState<null | SeriesRow>(null);
  const [previewItem, setPreviewItem] = useState<InstrumentPreviewItem | null>(null);

  const allGroupsLabel = t({ en: 'All groups', es: 'Todos los grupos', fr: 'Tous les groupes' });
  const formatStatus = ({ archivedAt }: SeriesRow) => {
    if (!archivedAt) {
      return t({ en: 'Active', es: 'Activo', fr: 'Actif' });
    }
    const date = toBasicISOString(archivedAt);
    return t({ en: `Archived on ${date}`, es: `Archivado el ${date}`, fr: `Archivé le ${date}` });
  };
  const toggleArchive = (row: SeriesRow) => {
    if (row.archivedAt) {
      unarchiveMutation.mutate({ id: row.id, isArchived: false });
    } else {
      setRowToArchive(row);
    }
  };

  const rows = sortSeriesOverviewRows<SeriesRow>(
    overviewQuery.data.map((series) => {
      const { details } = translateInstrumentInfo(series, resolvedLanguage);
      return {
        archivedAt: series.archivedAt,
        createdAt: series.createdAt ?? null,
        groupName: series.seriesGroup?.name ?? null,
        id: series.id,
        preview: {
          authors: details.authors,
          availability: series.seriesGroup ? { kind: 'group', name: series.seriesGroup.name } : { kind: 'all' },
          createdAt: series.createdAt ?? null,
          description: details.description,
          id: series.id,
          internal: null,
          kind: series.kind,
          seriesItems: series.seriesItems,
          source: toSource(series.sourceRepo),
          title: details.title
        },
        title: details.title
      };
    })
  );

  return (
    <>
      <DataTable
        columns={[
          {
            accessorKey: 'title',
            cell: (ctx) => <CellText text={ctx.getValue<string>()} />,
            header: t({ en: 'Name', es: 'Nombre', fr: 'Nom' })
          },
          {
            accessorFn: (row: SeriesRow) => row.groupName ?? allGroupsLabel,
            cell: (ctx) => <CellText text={ctx.getValue<string>()} />,
            header: t({ en: 'Group', es: 'Grupo', fr: 'Groupe' }),
            id: 'group'
          },
          {
            accessorFn: (row: SeriesRow) => (row.createdAt ? toBasicISOString(row.createdAt) : '-'),
            cell: (ctx) => <CellText text={ctx.getValue<string>()} />,
            header: t({ en: 'Created', es: 'Creado', fr: 'Créé' }),
            id: 'createdAt',
            size: 130
          },
          {
            accessorFn: formatStatus,
            cell: (ctx) => {
              const row = ctx.row.original;
              return (
                <CellText
                  className={row.archivedAt ? 'text-destructive' : 'text-green-700 dark:text-green-300'}
                  data-archived={row.archivedAt ? 'true' : 'false'}
                  data-testid="series-status"
                  text={formatStatus(row)}
                />
              );
            },
            header: t({ en: 'Status', es: 'Estado', fr: 'Statut' }),
            id: 'status',
            size: 200
          }
        ]}
        data={rows}
        emptyStateProps={{
          title: t({
            en: 'No series instruments have been created yet.',
            es: 'Aún no se ha creado ninguna serie de instrumentos.',
            fr: 'Aucun instrument en série n’a encore été créé.'
          })
        }}
        // libui shares the width evenly between unpinned columns and honours `size` only on pinned ones,
        // so the two short columns are pinned to leave the name the most room.
        initialState={{ columnPinning: { right: ['createdAt', 'status'] } }}
        rowActions={[
          {
            label: t({ en: 'Preview', es: 'Vista previa', fr: 'Aperçu' }),
            onSelect: (row: SeriesRow) => setPreviewItem(row.preview)
          },
          {
            disabled: (row: SeriesRow) => Boolean(row.archivedAt),
            label: t('common.archive'),
            onSelect: toggleArchive
          },
          {
            disabled: (row: SeriesRow) => !row.archivedAt || unarchiveMutation.isPending,
            label: t('common.unarchive'),
            onSelect: toggleArchive
          }
        ]}
        // libui applies its row hover highlight only when a click handler is set; a single click does nothing here.
        onRowClick={() => undefined}
        onRowDoubleClick={(row) => {
          if (!unarchiveMutation.isPending) {
            toggleArchive(row);
          }
        }}
      />
      {rowToArchive && <ArchiveDialog row={rowToArchive} onClose={() => setRowToArchive(null)} />}
      {previewItem && (
        <InstrumentPreviewDialog
          item={previewItem}
          items={scalarInstruments.map((info) => ({ id: info.id, title: info.details.title }))}
          onClose={() => setPreviewItem(null)}
        />
      )}
    </>
  );
};

const RouteComponent = () => {
  const { t } = useTranslation();
  const { view } = Route.useSearch();
  // Every edition, not only the latest: a series may name an older one, and its preview lists it.
  const instrumentInfoQuery = useInstrumentInfoQuery({ params: { allEditions: true } });
  const scalarInstruments = (instrumentInfoQuery.data ?? []).filter((info) => info.kind !== 'SERIES');

  return (
    <div data-testid="admin-instruments-page">
      <PageHeader>
        <Heading className="text-center" variant="h2">
          {view === 'series'
            ? t({ en: 'Series Instruments', es: 'Series de instrumentos', fr: 'Instruments en série' })
            : t({
                en: 'Form & Interactive Instruments',
                es: 'Instrumentos de formulario e interactivos',
                fr: 'Instruments de formulaire et interactifs'
              })}
        </Heading>
      </PageHeader>
      {view === 'series' ? (
        <SeriesInstrumentsView scalarInstruments={scalarInstruments} />
      ) : (
        <FormInstrumentsView scalarInstruments={scalarInstruments} />
      )}
    </div>
  );
};

export const Route = createFileRoute('/_app/admin/instruments')({
  component: RouteComponent,
  loader: async ({ context }) => {
    await Promise.all([
      context.queryClient.ensureQueryData(seriesInstrumentsOverviewQueryOptions()),
      context.queryClient.ensureQueryData(groupsQueryOptions())
    ]);
  },
  validateSearch: $AdminInstrumentsSearch
});
