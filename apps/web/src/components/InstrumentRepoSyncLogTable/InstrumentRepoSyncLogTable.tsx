import { Badge, DataTable } from '@douglasneuroinformatics/libui/components';
import { useTranslation } from '@douglasneuroinformatics/libui/hooks';
import type { InstrumentRepoSyncLog, InstrumentRepoSyncStage } from '@opendatacapture/schemas/instrument-repo';

import { SortableHeader } from '@/components/SortableHeader';

type InstrumentRepoSyncStatus = 'FAILED' | 'PARTIAL' | 'SUCCESS';

/** A sync that could not read the repository failed outright; one that skipped instruments partly succeeded. */
function getSyncStatus(log: InstrumentRepoSyncLog): InstrumentRepoSyncStatus {
  if (log.message) {
    return 'FAILED';
  }
  return log.failures.length ? 'PARTIAL' : 'SUCCESS';
}

const STATUS_BADGE_CLASSES = {
  FAILED: 'border-red-500/50 text-red-600 dark:text-red-400',
  PARTIAL: 'border-amber-500/50 text-amber-600 dark:text-amber-400',
  SUCCESS: 'border-green-500/50 text-green-600 dark:text-green-400'
} satisfies { [K in InstrumentRepoSyncStatus]: string };

type InstrumentRepoSyncLogTableProps = {
  logs: InstrumentRepoSyncLog[];
};

export const InstrumentRepoSyncLogTable = ({ logs }: InstrumentRepoSyncLogTableProps) => {
  const { t } = useTranslation();

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

  return (
    <div data-testid="instrument-repo-sync-log">
      <DataTable
        columns={[
          {
            accessorFn: (log: InstrumentRepoSyncLog) => log.createdAt.getTime(),
            cell: (ctx) => ctx.row.original.createdAt.toLocaleString(),
            header: ({ column }) => (
              <SortableHeader column={column} label={t({ en: 'Date', es: 'Fecha', fr: 'Date' })} />
            ),
            id: 'date'
          },
          {
            accessorKey: 'repoName',
            header: ({ column }) => (
              <SortableHeader column={column} label={t({ en: 'Repository', es: 'Repositorio', fr: 'Dépôt' })} />
            )
          },
          {
            accessorFn: (log: InstrumentRepoSyncLog) => actionLabels[log.action],
            header: ({ column }) => (
              <SortableHeader column={column} label={t({ en: 'Action', es: 'Acción', fr: 'Action' })} />
            ),
            id: 'action'
          },
          {
            accessorFn: (log: InstrumentRepoSyncLog) => getSyncStatus(log),
            cell: (ctx) => {
              const status = getSyncStatus(ctx.row.original);
              return (
                <Badge className={STATUS_BADGE_CLASSES[status]} data-testid="sync-log-status" variant="outline">
                  {statusLabels[status]}
                </Badge>
              );
            },
            header: ({ column }) => (
              <SortableHeader column={column} label={t({ en: 'Status', es: 'Estado', fr: 'Statut' })} />
            ),
            id: 'status'
          },
          {
            accessorKey: 'importedCount',
            header: ({ column }) => (
              <SortableHeader column={column} label={t({ en: 'Imported', es: 'Importados', fr: 'Importés' })} />
            )
          },
          {
            accessorFn: (log: InstrumentRepoSyncLog) => log.failures.length,
            header: ({ column }) => (
              <SortableHeader column={column} label={t({ en: 'Failed', es: 'Fallidos', fr: 'Échoués' })} />
            ),
            id: 'failedCount'
          },
          {
            cell: (ctx) => {
              const { failures, message } = ctx.row.original;
              if (!message && failures.length === 0) {
                return '-';
              }
              return (
                <ul className="flex flex-col gap-1 text-sm whitespace-normal" data-testid="sync-log-messages">
                  {message && <li className="text-destructive">{message}</li>}
                  {failures.map(({ instrumentDir, message, stage }) => (
                    <li key={instrumentDir}>
                      <span className="font-medium">{instrumentDir}</span>
                      <Badge className="mx-1.5" variant="outline">
                        {stageLabels[stage]}
                      </Badge>
                      {message}
                    </li>
                  ))}
                </ul>
              );
            },
            enableSorting: false,
            header: t({ en: 'Messages', es: 'Mensajes', fr: 'Messages' }),
            id: 'messages',
            size: 480
          }
        ]}
        data={logs}
        initialState={{ sorting: [{ desc: true, id: 'date' }] }}
      />
    </div>
  );
};
