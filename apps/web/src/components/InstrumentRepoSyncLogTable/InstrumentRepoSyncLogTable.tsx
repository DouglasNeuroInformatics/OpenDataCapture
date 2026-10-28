import { Badge, DataTable } from '@douglasneuroinformatics/libui/components';
import { useTheme, useTranslation } from '@douglasneuroinformatics/libui/hooks';
import type { InstrumentRepoSyncLog, InstrumentRepoSyncStage } from '@opendatacapture/schemas/instrument-repo';

import { ColorTagCell } from '@/components/ColorTagCell';
import { SortableHeader } from '@/components/SortableHeader';
import { getSyncStatus } from '@/utils/instrument-repo-sync';
import type { InstrumentRepoSyncStatus } from '@/utils/instrument-repo-sync';
import { getSyncStatusColor } from '@/utils/tag-colors';

type InstrumentRepoSyncLogTableProps = {
  logs: InstrumentRepoSyncLog[];
};

export const InstrumentRepoSyncLogTable = ({ logs }: InstrumentRepoSyncLogTableProps) => {
  const { t } = useTranslation();
  const [theme] = useTheme();

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
                <ColorTagCell
                  color={getSyncStatusColor(status, theme === 'dark' ? 'dark' : 'light')}
                  data-testid="sync-log-status"
                  label={statusLabels[status]}
                />
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
