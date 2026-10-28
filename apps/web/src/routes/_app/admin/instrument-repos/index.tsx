import { useState } from 'react';
import type { FormEvent } from 'react';

import {
  Button,
  DataTable,
  Dialog,
  Heading,
  Input,
  Label,
  SearchBar,
  Spinner
} from '@douglasneuroinformatics/libui/components';
import { useNotificationsStore, useTranslation } from '@douglasneuroinformatics/libui/hooks';
import type { TranslatedInstrumentInfo } from '@opendatacapture/schemas/instrument';
import { $CreateInstrumentRepoData } from '@opendatacapture/schemas/instrument-repo';
import type { InstrumentRepo, InstrumentRepoSyncLog } from '@opendatacapture/schemas/instrument-repo';
import { createFileRoute } from '@tanstack/react-router';
import { AnimatePresence, motion } from 'motion/react';

import { InstrumentRepoSyncLogTable } from '@/components/InstrumentRepoSyncLogTable';
import { PageHeader } from '@/components/PageHeader';
import { TruncatedCell } from '@/components/TruncatedCell';
import { useCreateInstrumentRepoMutation } from '@/hooks/useCreateInstrumentRepoMutation';
import { useDeleteInstrumentRepoMutation } from '@/hooks/useDeleteInstrumentRepoMutation';
import { groupsQueryOptions, useGroupsQuery } from '@/hooks/useGroupsQuery';
import { useInstrumentInfoQuery } from '@/hooks/useInstrumentInfoQuery';
import { instrumentReposQueryOptions, useInstrumentReposQuery } from '@/hooks/useInstrumentReposQuery';
import {
  instrumentRepoSyncLogsQueryOptions,
  useInstrumentRepoSyncLogsQuery
} from '@/hooks/useInstrumentRepoSyncLogsQuery';
import { useSyncAllInstrumentReposMutation } from '@/hooks/useSyncAllInstrumentReposMutation';
import { useSyncInstrumentRepoMutation } from '@/hooks/useSyncInstrumentRepoMutation';

/**
 * The instruments a repository currently provides: only the latest edition of each. Superseded
 * editions keep their repository provenance (records may still reference them), so without this a
 * bumped form would be listed once per edition it has ever had.
 */
function currentRepoInstruments(instruments: TranslatedInstrumentInfo[], repoId: string) {
  const fromRepo = instruments.filter((instrument) => instrument.sourceRepo?.id === repoId);
  // Keyed by internal name, which is what identifies one instrument across its editions. A series
  // has no edition of its own, so it is never superseded and never keyed.
  const latestEditions = new Map<string, number>();
  for (const instrument of fromRepo) {
    if (instrument.kind === 'SERIES') {
      continue;
    }
    const latest = latestEditions.get(instrument.internal.name);
    if (latest === undefined || latest < instrument.internal.edition) {
      latestEditions.set(instrument.internal.name, instrument.internal.edition);
    }
  }
  return fromRepo.filter((instrument) => {
    return instrument.kind === 'SERIES' || latestEditions.get(instrument.internal.name) === instrument.internal.edition;
  });
}

const AddRepoForm = ({
  isPending,
  onSubmit
}: {
  isPending: boolean;
  onSubmit: (data: $CreateInstrumentRepoData) => void;
}) => {
  const { t } = useTranslation();
  const [url, setUrl] = useState('');
  const [accessToken, setAccessToken] = useState('');
  const [error, setError] = useState<null | string>(null);

  if (isPending) {
    return (
      <div className="flex flex-col items-center gap-3 py-6">
        <Spinner />
        <p className="text-muted-foreground text-sm">
          {t({
            en: 'Importing instruments from GitHub...',
            es: 'Importando instrumentos desde GitHub...',
            fr: 'Importation des instruments depuis GitHub...'
          })}
        </p>
      </div>
    );
  }

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    const result = $CreateInstrumentRepoData.safeParse({
      accessToken: accessToken.trim() === '' ? undefined : accessToken.trim(),
      url: url.trim()
    });
    if (!result.success) {
      setError(
        t({
          en: 'Please enter a valid GitHub repository URL.',
          es: 'Introduzca una URL de repositorio de GitHub válida.',
          fr: 'Veuillez entrer une URL de dépôt GitHub valide.'
        })
      );
      return;
    }
    onSubmit(result.data);
  };

  return (
    // autoComplete="off" plus non-semantic field names prevent the browser / password managers from
    // autofilling the URL and token fields.
    <form autoComplete="off" className="flex flex-col gap-4" onSubmit={handleSubmit}>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="instrument-repo-url">{t({ en: 'GitHub URL', es: 'URL de GitHub', fr: 'URL GitHub' })}</Label>
        <Input
          autoComplete="off"
          id="instrument-repo-url"
          name="instrument-repo-url"
          placeholder="https://github.com/owner/repository"
          value={url}
          onChange={(event) => setUrl(event.target.value)}
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="instrument-repo-token">
          {t({
            en: 'Personal Access Token (optional*)',
            es: 'Token de acceso personal (opcional*)',
            fr: "Jeton d'accès personnel (facultatif*)"
          })}
        </Label>
        <Input
          autoComplete="new-password"
          id="instrument-repo-token"
          name="instrument-repo-token"
          type="password"
          value={accessToken}
          onChange={(event) => setAccessToken(event.target.value)}
        />
        <p className="text-muted-foreground text-xs">
          {t({
            en: '*Required only for private repositories. Stored encrypted and reused when syncing.',
            es: '*Solo es necesario para repositorios privados. Se almacena cifrado y se reutiliza al sincronizar.',
            fr: '*Requis uniquement pour les dépôts privés. Stocké de manière chiffrée et réutilisé lors de la synchronisation.'
          })}
        </p>
      </div>
      {error && <p className="text-destructive text-sm">{error}</p>}
      <Button className="w-full" type="submit">
        {t({ en: 'Import', es: 'Importar', fr: 'Importer' })}
      </Button>
    </form>
  );
};

/** The most recent log per repository; the API returns the history newest first. */
function latestSyncLogs(logs: InstrumentRepoSyncLog[]) {
  const latest = new Map<string, InstrumentRepoSyncLog>();
  for (const log of logs) {
    if (log.repoId && !latest.has(log.repoId)) {
      latest.set(log.repoId, log);
    }
  }
  return latest;
}

const RouteComponent = () => {
  const { t } = useTranslation();
  const addNotification = useNotificationsStore((store) => store.addNotification);
  const reposQuery = useInstrumentReposQuery();
  const groupsQuery = useGroupsQuery();
  const createRepoMutation = useCreateInstrumentRepoMutation();
  const deleteRepoMutation = useDeleteInstrumentRepoMutation();
  const syncRepoMutation = useSyncInstrumentRepoMutation();
  const syncAllReposMutation = useSyncAllInstrumentReposMutation();
  const syncLogsQuery = useInstrumentRepoSyncLogsQuery();
  // Every edition, because the default collapses editions across all sources, not per repository;
  // `currentRepoInstruments` then keeps the latest edition each repository provides.
  const instrumentInfoQuery = useInstrumentInfoQuery({ params: { allEditions: true } });
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [repoToView, setRepoToView] = useState<InstrumentRepo | null>(null);
  const [instrumentSearch, setInstrumentSearch] = useState('');
  const [repoToShowLogs, setRepoToShowLogs] = useState<InstrumentRepo | null>(null);
  const [repoToDelete, setRepoToDelete] = useState<InstrumentRepo | null>(null);
  const [highlightedRowId, setHighlightedRowId] = useState<null | string>(null);

  // Compute which repos are currently assigned to at least one (live) group.
  const inUseRepoIds = new Set(groupsQuery.data.flatMap((group) => group.instrumentRepoIds));
  const latestSyncLogByRepoId = latestSyncLogs(syncLogsQuery.data);

  const handleDeleteClick = (repo: InstrumentRepo) => {
    if (inUseRepoIds.has(repo.id)) {
      addNotification({
        message: t({
          en: `"${repo.name}" is assigned to one or more groups. Remove it from those groups before deleting.`,
          es: `"${repo.name}" está asignado a uno o más grupos. Quítelo de esos grupos antes de eliminarlo.`,
          fr: `« ${repo.name} » est assigné à un ou plusieurs groupes. Retirez-le de ces groupes avant de le supprimer.`
        }),
        type: 'warning'
      });
      return;
    }
    setRepoToDelete(repo);
    setIsConfirmDeleteOpen(true);
  };

  return (
    <Dialog
      open={isDialogOpen || isConfirmDeleteOpen || isViewOpen || repoToShowLogs !== null}
      onOpenChange={() => {
        setIsDialogOpen(false);
        setIsConfirmDeleteOpen(false);
        setIsViewOpen(false);
        setRepoToView(null);
        setRepoToDelete(null);
        setRepoToShowLogs(null);
        setInstrumentSearch('');
      }}
    >
      <PageHeader>
        <Heading className="text-center" variant="h2">
          {t({
            en: 'Instrument Repositories',
            es: 'Repositorios de instrumentos',
            fr: "Dépôts d'instruments"
          })}
        </Heading>
      </PageHeader>
      <DataTable
        columns={[
          {
            accessorKey: 'name',
            cell: (ctx) => {
              const repo = ctx.row.original;
              return (
                <span className="flex items-center">
                  {repo.name}
                  <span className="hidden" data-row-selected={highlightedRowId === repo.id ? 'true' : 'false'} />
                </span>
              );
            },
            header: t({
              en: 'Repository Name',
              es: 'Nombre del repositorio',
              fr: 'Nom du dépôt'
            })
          },
          {
            accessorKey: 'url',
            cell: (ctx) => (
              <TruncatedCell
                data-testid="instrument-repo-url"
                title={ctx.row.original.url}
                value={ctx.row.original.url}
              />
            ),
            header: 'URL'
          },
          {
            accessorFn: (row: InstrumentRepo) => {
              return instrumentInfoQuery.data
                ? currentRepoInstruments(instrumentInfoQuery.data, row.id).length
                : row.instrumentIds.length;
            },
            header: t({
              en: 'Instruments',
              es: 'Instrumentos',
              fr: 'Instruments'
            }),
            id: 'instrumentCount'
          },
          {
            cell: (ctx) => {
              const log = latestSyncLogByRepoId.get(ctx.row.original.id);
              if (log?.message) {
                return (
                  <span className="text-destructive font-medium" data-testid="instrument-repo-failed-count">
                    {t({ en: 'Sync failed', es: 'Sincronización fallida', fr: 'Échec de la synchronisation' })}
                  </span>
                );
              }
              const failedCount = log?.failures.length ?? 0;
              return (
                <span
                  className={failedCount ? 'text-destructive font-medium' : undefined}
                  data-testid="instrument-repo-failed-count"
                >
                  {failedCount}
                </span>
              );
            },
            header: t({ en: 'Failed', es: 'Fallidos', fr: 'Échoués' }),
            id: 'failedCount'
          },
          {
            accessorFn: (row: InstrumentRepo) => {
              return row.lastSyncedAt ? new Date(row.lastSyncedAt).toLocaleDateString() : '-';
            },
            header: t({
              en: 'Last Synced',
              es: 'Última sincronización',
              fr: 'Dernière synchronisation'
            }),
            id: 'lastSynced'
          }
        ]}
        data={reposQuery.data}
        rowActions={[
          {
            label: t({
              en: 'Sync',
              es: 'Sincronizar',
              fr: 'Synchroniser'
            }),
            onSelect: (repo: InstrumentRepo) => {
              syncRepoMutation.mutate({ id: repo.id });
            }
          },
          {
            label: t({
              en: 'View',
              es: 'Ver',
              fr: 'Voir'
            }),
            onSelect: (repo: InstrumentRepo) => {
              setRepoToView(repo);
              setIsViewOpen(true);
            }
          },
          {
            label: t({ en: 'Logs', es: 'Registros', fr: 'Journaux' }),
            onSelect: setRepoToShowLogs
          },
          {
            label: t('core.delete'),
            onSelect: handleDeleteClick
          }
        ]}
        togglesComponent={() => (
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setIsDialogOpen(true)}>
              {t({
                en: 'Add Repository',
                es: 'Agregar repositorio',
                fr: 'Ajouter un dépôt'
              })}
            </Button>
            <Button
              disabled={syncAllReposMutation.isPending || reposQuery.data.length === 0}
              variant="outline"
              onClick={() => syncAllReposMutation.mutate()}
            >
              {t({
                en: 'Sync All',
                es: 'Sincronizar todo',
                fr: 'Tout synchroniser'
              })}
            </Button>
          </div>
        )}
        onRowClick={(repo) => setHighlightedRowId(repo.id)}
        onRowDoubleClick={(repo) => {
          setHighlightedRowId(repo.id);
          syncRepoMutation.mutate({ id: repo.id });
        }}
      />
      <section className="mt-10 flex flex-col gap-4">
        <Heading variant="h4">
          {t({ en: 'Sync History', es: 'Historial de sincronización', fr: 'Historique de synchronisation' })}
        </Heading>
        <InstrumentRepoSyncLogTable logs={syncLogsQuery.data} />
      </section>
      {repoToShowLogs && (
        <Dialog.Content className="sm:max-w-275">
          <Dialog.Header>
            <Dialog.Title>
              {t({
                en: `Sync history of "${repoToShowLogs.name}"`,
                es: `Historial de sincronización de "${repoToShowLogs.name}"`,
                fr: `Historique de synchronisation de « ${repoToShowLogs.name} »`
              })}
            </Dialog.Title>
          </Dialog.Header>
          <div className="max-h-[70vh] overflow-auto">
            <InstrumentRepoSyncLogTable logs={syncLogsQuery.data.filter((log) => log.repoId === repoToShowLogs.id)} />
          </div>
        </Dialog.Content>
      )}
      {isDialogOpen && (
        <Dialog.Content className="sm:max-w-118.75">
          <Dialog.Header>
            <Dialog.Title>
              {t({
                en: 'Add Instrument Repository',
                es: 'Agregar repositorio de instrumentos',
                fr: "Ajouter un dépôt d'instruments"
              })}
            </Dialog.Title>
            <Dialog.Description>
              {t({
                en: 'Enter the GitHub URL of the instrument repository. Importing may take a minute.',
                es: 'Introduzca la URL de GitHub del repositorio de instrumentos. La importación puede tardar un minuto.',
                fr: "Entrez l'URL GitHub du dépôt d'instruments. L'importation peut prendre une minute."
              })}
            </Dialog.Description>
          </Dialog.Header>
          <AddRepoForm
            isPending={createRepoMutation.isPending}
            onSubmit={(data) => {
              createRepoMutation.mutate({ data }, { onSuccess: () => setIsDialogOpen(false) });
            }}
          />
        </Dialog.Content>
      )}
      {isViewOpen && repoToView && (
        <Dialog.Content className="sm:max-w-225">
          <Dialog.Header>
            <Dialog.Title>
              {t({
                en: `Instruments in "${repoToView.name}"`,
                es: `Instrumentos de "${repoToView.name}"`,
                fr: `Instruments dans « ${repoToView.name} »`
              })}
            </Dialog.Title>
            <Dialog.Description>
              {t({ en: 'Source: ', es: 'Fuente: ', fr: 'Source : ' })}
              <a
                className="underline underline-offset-4"
                data-testid="instrument-repo-source-link"
                href={repoToView.url}
                rel="noreferrer"
                target="_blank"
              >
                {repoToView.url}
              </a>
            </Dialog.Description>
          </Dialog.Header>
          <SearchBar
            placeholder={t({
              en: 'Search instruments...',
              es: 'Buscar instrumentos...',
              fr: 'Rechercher des instruments...'
            })}
            value={instrumentSearch}
            onValueChange={setInstrumentSearch}
          />
          {(() => {
            const searchTerm = instrumentSearch.trim().toLowerCase();
            const repoInstruments =
              instrumentInfoQuery.data &&
              currentRepoInstruments(instrumentInfoQuery.data, repoToView.id).filter((instrument) =>
                instrument.details.title.toLowerCase().includes(searchTerm)
              );
            if (instrumentInfoQuery.isLoading) {
              return (
                <div className="flex justify-center py-6">
                  <Spinner />
                </div>
              );
            }
            if (!repoInstruments?.length) {
              return (
                <p className="text-muted-foreground py-4 text-center text-sm">
                  {searchTerm
                    ? t({
                        en: 'No instruments match your search.',
                        es: 'Ningún instrumento coincide con su búsqueda.',
                        fr: 'Aucun instrument ne correspond à votre recherche.'
                      })
                    : t({
                        en: 'No instruments found in this repository.',
                        es: 'No se encontraron instrumentos en este repositorio.',
                        fr: 'Aucun instrument trouvé dans ce dépôt.'
                      })}
                </p>
              );
            }
            return (
              <div className="flex max-h-[60vh] flex-col gap-5 overflow-auto pr-3">
                <div className="grid grid-cols-[1fr_8rem_5rem] gap-x-6 font-bold">
                  <p>{t({ en: 'Title', es: 'Título', fr: 'Titre' })}</p>
                  <p>{t({ en: 'Kind', es: 'Tipo', fr: 'Type' })}</p>
                  <p>{t({ en: 'Edition', es: 'Edición', fr: 'Édition' })}</p>
                </div>
                <hr />
                <ul className="flex flex-col gap-5">
                  <AnimatePresence mode="popLayout">
                    {repoInstruments.map((instrument, i) => (
                      <motion.li
                        layout
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        initial={{ opacity: 0 }}
                        key={instrument.id}
                        transition={{ bounce: 0.2, delay: 0.15 * i, duration: 1.5, type: 'spring' }}
                      >
                        <div className="grid grid-cols-[1fr_8rem_5rem] gap-x-6">
                          <p className="truncate" title={instrument.details.title}>
                            {instrument.details.title}
                          </p>
                          <p className="text-muted-foreground">{instrument.kind}</p>
                          <p className="text-muted-foreground">
                            {instrument.kind === 'SERIES' ? '-' : instrument.internal.edition}
                          </p>
                        </div>
                      </motion.li>
                    ))}
                  </AnimatePresence>
                </ul>
              </div>
            );
          })()}
        </Dialog.Content>
      )}
      {isConfirmDeleteOpen && repoToDelete && (
        <Dialog.Content>
          <Dialog.Header>
            <Dialog.Title>
              {t({
                en: 'Are you absolutely sure?',
                es: '¿Está completamente seguro?',
                fr: 'Êtes-vous absolument sûr ?'
              })}
            </Dialog.Title>
            <Dialog.Description>
              {t({
                en: `This will remove the repository "${repoToDelete.name}" from the system. Deletion is only possible if no groups currently have this repository assigned.`,
                es: `Esto eliminará el repositorio "${repoToDelete.name}" del sistema. Solo se puede eliminar si ningún grupo lo tiene asignado actualmente.`,
                fr: `Cela supprimera le dépôt « ${repoToDelete.name} » du système. La suppression n'est possible que si aucun groupe n'utilise actuellement ce dépôt.`
              })}
            </Dialog.Description>
          </Dialog.Header>
          <Dialog.Footer>
            <Button
              className="min-w-16"
              type="button"
              variant="danger"
              onClick={() => {
                deleteRepoMutation.mutate({ id: repoToDelete.id });
                setIsConfirmDeleteOpen(false);
                setRepoToDelete(null);
              }}
            >
              {t('core.yes')}
            </Button>
            <Button
              className="min-w-16"
              type="button"
              variant="outline"
              onClick={() => {
                setIsConfirmDeleteOpen(false);
                setRepoToDelete(null);
              }}
            >
              {t('core.no')}
            </Button>
          </Dialog.Footer>
        </Dialog.Content>
      )}
    </Dialog>
  );
};

export const Route = createFileRoute('/_app/admin/instrument-repos/')({
  component: RouteComponent,
  loader: async ({ context }) => {
    await context.queryClient.ensureQueryData(instrumentReposQueryOptions());
    await context.queryClient.ensureQueryData(groupsQueryOptions());
    await context.queryClient.ensureQueryData(instrumentRepoSyncLogsQueryOptions());
  }
});
