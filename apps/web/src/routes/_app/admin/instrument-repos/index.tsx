import { useMemo, useState } from 'react';
import type { FormEvent } from 'react';

import { Button, DataTable, Dialog, Heading, Input, Label, Spinner } from '@douglasneuroinformatics/libui/components';
import { useEventCallback, useNotificationsStore, useTranslation } from '@douglasneuroinformatics/libui/hooks';
import { $CreateInstrumentRepoData } from '@opendatacapture/schemas/instrument-repo';
import type { CreateInstrumentRepoData, InstrumentRepo } from '@opendatacapture/schemas/instrument-repo';
import { createFileRoute } from '@tanstack/react-router';
import { AnimatePresence, motion } from 'motion/react';

import {
  DataTableRowHighlight,
  DataTableRowHighlightProvider,
  dataTableRowHighlightRootStyle
} from '@/components/DataTableRowHighlight';
import { PageHeader } from '@/components/PageHeader';
import { useCreateInstrumentRepoMutation } from '@/hooks/useCreateInstrumentRepoMutation';
import { useDeleteInstrumentRepoMutation } from '@/hooks/useDeleteInstrumentRepoMutation';
import { groupsQueryOptions, useGroupsQuery } from '@/hooks/useGroupsQuery';
import { useInstrumentInfoQuery } from '@/hooks/useInstrumentInfoQuery';
import { instrumentReposQueryOptions, useInstrumentReposQuery } from '@/hooks/useInstrumentReposQuery';
import { useSyncInstrumentRepoMutation } from '@/hooks/useSyncInstrumentRepoMutation';

const AddRepoForm = ({
  isPending,
  onSubmit
}: {
  isPending: boolean;
  onSubmit: (data: CreateInstrumentRepoData) => void;
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
        <Label htmlFor="instrument-repo-url">{t({ en: 'GitHub URL', fr: 'URL GitHub' })}</Label>
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
          {t({ en: 'Personal Access Token (optional*)', fr: "Jeton d'accès personnel (facultatif*)" })}
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
            fr: '*Requis uniquement pour les dépôts privés. Stocké de manière chiffrée et réutilisé lors de la synchronisation.'
          })}
        </p>
      </div>
      {error && <p className="text-destructive text-sm">{error}</p>}
      <Button className="w-full" type="submit">
        {t({ en: 'Import', fr: 'Importer' })}
      </Button>
    </form>
  );
};

const RouteComponent = () => {
  const { t } = useTranslation();
  const addNotification = useNotificationsStore((store) => store.addNotification);
  const reposQuery = useInstrumentReposQuery();
  const groupsQuery = useGroupsQuery();
  const createRepoMutation = useCreateInstrumentRepoMutation();
  const deleteRepoMutation = useDeleteInstrumentRepoMutation();
  const syncRepoMutation = useSyncInstrumentRepoMutation();
  const instrumentInfoQuery = useInstrumentInfoQuery();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [repoToView, setRepoToView] = useState<InstrumentRepo | null>(null);
  const [repoToDelete, setRepoToDelete] = useState<InstrumentRepo | null>(null);
  const [highlightedRowId, setHighlightedRowId] = useState<null | string>(null);

  // Compute which repos are currently assigned to at least one (live) group.
  const inUseRepoIds = new Set(groupsQuery.data.flatMap((group) => group.instrumentRepoIds));

  const handleDeleteClick = useEventCallback((repo: InstrumentRepo) => {
    if (inUseRepoIds.has(repo.id)) {
      addNotification({
        message: t({
          en: `"${repo.name}" is assigned to one or more groups. Remove it from those groups before deleting.`,
          fr: `« ${repo.name} » est assigné à un ou plusieurs groupes. Retirez-le de ces groupes avant de le supprimer.`
        }),
        type: 'warning'
      });
      return;
    }
    setRepoToDelete(repo);
    setIsConfirmDeleteOpen(true);
  });

  const handleSync = useEventCallback((repo: InstrumentRepo) => {
    syncRepoMutation.mutate({ id: repo.id });
  });

  const dataTable = useMemo(
    () => (
      <DataTable
        columns={[
          {
            accessorKey: 'name',
            cell: (ctx) => {
              const repo = ctx.row.original;
              return (
                <span className="flex items-center">
                  {repo.name}
                  <DataTableRowHighlight rowId={repo.id} />
                </span>
              );
            },
            header: t({
              en: 'Repository Name',
              fr: 'Nom du dépôt'
            })
          },
          {
            accessorKey: 'url',
            header: 'URL'
          },
          {
            accessorFn: (row: InstrumentRepo) => row.instrumentIds.length,
            header: t({
              en: 'Instruments',
              fr: 'Instruments'
            }),
            id: 'instrumentCount'
          },
          {
            accessorFn: (row: InstrumentRepo) =>
              row.lastSyncedAt ? new Date(row.lastSyncedAt).toLocaleDateString() : '-',
            header: t({
              en: 'Last Synced',
              fr: 'Dernière synchronisation'
            }),
            id: 'lastSynced'
          }
        ]}
        data={reposQuery.data}
        rootStyle={dataTableRowHighlightRootStyle}
        rowActions={[
          {
            label: t({
              en: 'Sync',
              fr: 'Synchroniser'
            }),
            onSelect: handleSync
          },
          {
            label: t({
              en: 'View',
              fr: 'Voir'
            }),
            onSelect: (repo: InstrumentRepo) => {
              setRepoToView(repo);
              setIsViewOpen(true);
            }
          },
          {
            label: t('core.delete'),
            onSelect: handleDeleteClick
          }
        ]}
        togglesComponent={() => (
          <Button variant="outline" onClick={() => setIsDialogOpen(true)}>
            {t({
              en: 'Add Repository',
              fr: 'Ajouter un dépôt'
            })}
          </Button>
        )}
        onRowClick={(repo) => setHighlightedRowId(repo.id)}
        onRowDoubleClick={handleSync}
      />
    ),
    [handleDeleteClick, handleSync, reposQuery.data, t]
  );

  return (
    <Dialog
      open={isDialogOpen || isConfirmDeleteOpen || isViewOpen}
      onOpenChange={(open) => {
        if (!open) {
          setIsDialogOpen(false);
          setIsConfirmDeleteOpen(false);
          setIsViewOpen(false);
          setRepoToView(null);
          setRepoToDelete(null);
        }
      }}
    >
      <PageHeader>
        <Heading className="text-center" variant="h2">
          {t({
            en: 'Instrument Repositories',
            fr: "Dépôts d'instruments"
          })}
        </Heading>
      </PageHeader>
      <DataTableRowHighlightProvider rowId={highlightedRowId}>{dataTable}</DataTableRowHighlightProvider>
      {isDialogOpen && (
        <Dialog.Content className="sm:max-w-[475px]">
          <Dialog.Header>
            <Dialog.Title>
              {t({
                en: 'Add Instrument Repository',
                fr: "Ajouter un dépôt d'instruments"
              })}
            </Dialog.Title>
            <Dialog.Description>
              {t({
                en: 'Enter the GitHub URL of the instrument repository. Importing may take a minute.',
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
        <Dialog.Content className="sm:max-w-[900px]">
          <Dialog.Header>
            <Dialog.Title>
              {t({
                en: `Instruments in "${repoToView.name}"`,
                fr: `Instruments dans « ${repoToView.name} »`
              })}
            </Dialog.Title>
          </Dialog.Header>
          {(() => {
            const repoInstruments = instrumentInfoQuery.data?.filter(
              (instrument) => instrument.sourceRepo?.id === repoToView.id
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
                  {t({
                    en: 'No instruments found in this repository.',
                    fr: 'Aucun instrument trouvé dans ce dépôt.'
                  })}
                </p>
              );
            }
            return (
              <div className="flex max-h-[60vh] flex-col gap-5 overflow-auto pr-3">
                <div className="grid grid-cols-[1fr_8rem_5rem] gap-x-6 font-bold">
                  <p>{t({ en: 'Title', fr: 'Titre' })}</p>
                  <p>{t({ en: 'Kind', fr: 'Type' })}</p>
                  <p>{t({ en: 'Edition', fr: 'Édition' })}</p>
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
                          <p className="text-muted-foreground">{instrument.internal?.edition ?? '-'}</p>
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
                fr: 'Êtes-vous absolument sûr ?'
              })}
            </Dialog.Title>
            <Dialog.Description>
              {t({
                en: `This will remove the repository "${repoToDelete.name}" from the system. Deletion is only possible if no groups currently have this repository assigned.`,
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
  }
});
