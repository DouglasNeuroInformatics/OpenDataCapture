import { Fragment, useState } from 'react';

import { Badge, Button, DataTable, Dialog } from '@douglasneuroinformatics/libui/components';
import { useTheme, useTranslation } from '@douglasneuroinformatics/libui/hooks';
import type { InstrumentRepoSyncLog, InstrumentRepoSyncStage } from '@opendatacapture/schemas/instrument-repo';

import { ColorTagCell } from '@/components/ColorTagCell';
import { SortableHeader } from '@/components/SortableHeader';
import { getSyncStatus } from '@/utils/instrument-repo-sync';
import type { InstrumentRepoSyncStatus } from '@/utils/instrument-repo-sync';
import { getSyncStatusColor } from '@/utils/tag-colors';

type InstrumentRepoSyncLogTableProps = {
  logs: InstrumentRepoSyncLog[];
  onPageChange: (page: number) => void;
  onSortOrderChange: (sortOrder: 'asc' | 'desc') => void;
  pageCount: number;
  sortOrder: 'asc' | 'desc';
};

export const InstrumentRepoSyncLogTable = ({
  logs,
  onPageChange,
  onSortOrderChange,
  pageCount,
  sortOrder
}: InstrumentRepoSyncLogTableProps) => {
  const { t } = useTranslation();
  const [theme] = useTheme();
  const [logToView, setLogToView] = useState<InstrumentRepoSyncLog | null>(null);

  const statusLabels = {
    FAILED: t({ en: 'Failed', es: 'Fallido', fr: 'Échec' }),
    PARTIAL: t({ en: 'Partial success', es: 'Éxito parcial', fr: 'Succès partiel' }),
    SUCCESS: t({ en: 'Success', es: 'Éxito', fr: 'Succès' })
  } satisfies { [K in InstrumentRepoSyncStatus]: string };

  const actionLabels = {
    IMPORT: t({ en: 'Import', es: 'Importación', fr: 'Importation' }),
    SYNC: t({ en: 'Sync', es: 'Sincronización', fr: 'Synchronisation' })
  } satisfies { [K in InstrumentRepoSyncLog['action']]: string };

  const stageLabels = {
    BUNDLE: t({ en: 'Compile', es: 'Compilación', fr: 'Compilation' }),
    LOAD: t({ en: 'Load', es: 'Carga', fr: 'Chargement' })
  } satisfies { [K in InstrumentRepoSyncStage]: string };

  /**
   * The cell holds one line of plain text, so a reason long enough to wrap would otherwise make the
   * row several times taller than the rest. The whole reason lives in the dialog the View button opens.
   */
  const summarize = ({ failures, message }: InstrumentRepoSyncLog): null | string => {
    if (message) {
      return message;
    }
    if (failures.length > 1) {
      return t({
        en: `${failures.length} instruments failed`,
        es: `${failures.length} instrumentos fallaron`,
        fr: `${failures.length} instruments ont échoué`
      });
    }
    const [failure] = failures;
    if (!failure) {
      return null;
    }
    return `${failure.instrumentDir} (${stageLabels[failure.stage]}): ${failure.message}`;
  };

  /** Which import or sync the dialog is showing, since the dialog is detached from its row. */
  const describeLog = (log: InstrumentRepoSyncLog) =>
    `${log.repoName} · ${actionLabels[log.action]} · ${log.createdAt.toLocaleString()}`;

  if (logs.length === 0) {
    // Not an empty DataTable: its own empty state is a fixed 288px tall, which dwarfs the heading.
    return (
      <p
        className="text-muted-foreground rounded-md border py-4 text-center text-sm"
        data-testid="instrument-repo-sync-log"
      >
        {t({
          en: 'No imports or syncs recorded yet.',
          es: 'Aún no se han registrado importaciones ni sincronizaciones.',
          fr: "Aucun import ni synchronisation enregistré pour l'instant."
        })}
      </p>
    );
  }

  return (
    <Fragment>
      <div data-testid="instrument-repo-sync-log">
        <DataTable
          disableSearch
          columns={[
            {
              cell: (ctx) => ctx.row.original.createdAt.toLocaleString(),
              enableSorting: true,
              header: ({ column }) => (
                <SortableHeader
                  column={column}
                  label={t({ en: 'Date', es: 'Fecha', fr: 'Date' })}
                  sortOrder={sortOrder}
                />
              ),
              id: 'date',
              // The rows already arrive newest first, so the table's first toggle of its unsorted
              // column must go to ascending, or the first click would request what is on screen.
              sortDescFirst: false
            },
            {
              accessorKey: 'repoName',
              enableSorting: false,
              header: t({ en: 'Repository', es: 'Repositorio', fr: 'Dépôt' })
            },
            {
              accessorFn: (log: InstrumentRepoSyncLog) => actionLabels[log.action],
              enableSorting: false,
              header: t({ en: 'Action', es: 'Acción', fr: 'Action' }),
              id: 'action'
            },
            {
              cell: (ctx) => {
                const status = getSyncStatus(ctx.row.original);
                return (
                  <ColorTagCell
                    color={getSyncStatusColor(status, theme === 'dark' ? 'dark' : 'light')}
                    data-testid="sync-log-status"
                    label={statusLabels[status]}
                  />
                );
              },
              enableSorting: false,
              header: t({ en: 'Status', es: 'Estado', fr: 'Statut' }),
              id: 'status'
            },
            {
              accessorKey: 'importedCount',
              enableSorting: false,
              header: t({ en: 'Imported', es: 'Importados', fr: 'Importés' })
            },
            {
              accessorFn: (log: InstrumentRepoSyncLog) => log.failures.length,
              enableSorting: false,
              header: t({ en: 'Failed', es: 'Fallidos', fr: 'Échoués' }),
              id: 'failedCount'
            },
            {
              cell: (ctx) => {
                const log = ctx.row.original;
                const summary = summarize(log);
                if (!summary) {
                  return '-';
                }
                return (
                  <div className="flex w-full items-center gap-2">
                    <span
                      className="min-w-0 flex-1 overflow-hidden text-ellipsis whitespace-nowrap"
                      data-testid="sync-log-messages"
                      title={summary}
                    >
                      {summary}
                    </span>
                    <Button
                      className="h-6 shrink-0 px-2"
                      data-testid="sync-log-view-messages"
                      size="sm"
                      type="button"
                      variant="outline"
                      onClick={() => setLogToView(log)}
                    >
                      {t('common.view')}
                    </Button>
                  </div>
                );
              },
              enableSorting: false,
              header: t({ en: 'Messages', es: 'Mensajes', fr: 'Messages' }),
              id: 'messages',
              size: 480
            }
          ]}
          data={logs}
          mode="server"
          pageCount={pageCount}
          onPaginationChange={({ pageIndex }) => onPageChange(pageIndex + 1)}
          // Date is the only sortable column, so the state describes it or nothing.
          onSortingChange={(state) => onSortOrderChange(state.some(({ desc }) => desc) ? 'desc' : 'asc')}
        />
      </div>
      <Dialog open={logToView !== null} onOpenChange={() => setLogToView(null)}>
        {logToView && (
          <Dialog.Content className="sm:max-w-150">
            <Dialog.Header>
              <Dialog.Title>
                {t({ en: 'Error Details', es: 'Detalles del error', fr: "Détails de l'erreur" })}
              </Dialog.Title>
              <Dialog.Description>{describeLog(logToView)}</Dialog.Description>
            </Dialog.Header>
            <div className="flex max-h-[60vh] flex-col gap-4 overflow-auto" data-testid="sync-log-error-details">
              {logToView.message && (
                <pre className="text-destructive font-mono text-xs break-words whitespace-pre-wrap">
                  {logToView.message}
                </pre>
              )}
              {logToView.failures.map(({ instrumentDir, message, stage }) => (
                <div key={instrumentDir}>
                  <div className="mb-1.5 flex items-center gap-2">
                    <span className="text-sm font-medium">{instrumentDir}</span>
                    <Badge variant="outline">{stageLabels[stage]}</Badge>
                  </div>
                  <pre className="bg-muted rounded-md p-3 font-mono text-xs break-words whitespace-pre-wrap">
                    {message}
                  </pre>
                </div>
              ))}
            </div>
          </Dialog.Content>
        )}
      </Dialog>
    </Fragment>
  );
};
