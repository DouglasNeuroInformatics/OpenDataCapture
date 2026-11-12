import { useEffect, useState } from 'react';

import { toBasicISOString } from '@douglasneuroinformatics/libjs';
import { Button, Checkbox, DataTable, Dialog, Heading, Sheet } from '@douglasneuroinformatics/libui/components';
import { useNotificationsStore, useTheme, useTranslation } from '@douglasneuroinformatics/libui/hooks';
import { $Group } from '@opendatacapture/schemas/group';
import type { Group } from '@opendatacapture/schemas/group';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createFileRoute, Link } from '@tanstack/react-router';
import axios from 'axios';

import { ColorTagCell } from '@/components/ColorTagCell';
import { PageHeader } from '@/components/PageHeader';
import { SortableHeader } from '@/components/SortableHeader';
import { useArchiveGroupMutation } from '@/hooks/useArchiveGroupMutation';
import { GROUPS_QUERY_KEY, groupsQueryOptions, useGroupsQuery } from '@/hooks/useGroupsQuery';
import {
  INSTRUMENT_REPOS_QUERY_KEY,
  instrumentReposQueryOptions,
  useInstrumentReposQuery
} from '@/hooks/useInstrumentReposQuery';
import { useUnarchiveGroupMutation } from '@/hooks/useUnarchiveGroupMutation';
import { resolveTheme } from '@/utils/chart-theme';
import { getApiErrorMessage } from '@/utils/error';
import { getArchiveStatusColor, getGroupTypeColor } from '@/utils/tag-colors';

const RouteComponent = () => {
  const { t } = useTranslation();
  const [theme] = useTheme();
  const queryClient = useQueryClient();
  const addNotification = useNotificationsStore((store) => store.addNotification);
  const groupsQuery = useGroupsQuery();
  const archiveGroupMutation = useArchiveGroupMutation();
  const unarchiveGroupMutation = useUnarchiveGroupMutation();
  const reposQuery = useInstrumentReposQuery();
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [selectedRepoIds, setSelectedRepoIds] = useState<Set<string>>(new Set());
  const [isConfirmArchiveOpen, setIsConfirmArchiveOpen] = useState(false);
  const [highlightedRowId, setHighlightedRowId] = useState<null | string>(null);

  const updateGroupReposMutation = useMutation({
    mutationFn: async ({ groupId, instrumentRepoIds }: { groupId: string; instrumentRepoIds: string[] }) => {
      const response = await axios.patch(
        `/v1/groups/${groupId}`,
        { instrumentRepoIds },
        { meta: { disableDefaultErrorNotification: true } }
      );
      return $Group.parseAsync(response.data);
    },
    onError(err) {
      addNotification({
        message: getApiErrorMessage(
          err,
          t({
            en: 'Failed to update group repositories',
            es: 'Error al actualizar los repositorios del grupo',
            fr: 'Échec de la mise à jour des dépôts du groupe'
          })
        ),
        type: 'error'
      });
    },
    onSuccess() {
      addNotification({ type: 'success' });
      void queryClient.invalidateQueries({ queryKey: [GROUPS_QUERY_KEY] });
      // Group<->repo assignments changed, so the repos page's "in use" state must refetch too.
      void queryClient.invalidateQueries({ queryKey: [INSTRUMENT_REPOS_QUERY_KEY] });
      // Close the sheet only after a successful save so the user keeps their selection on failure.
      setSelectedGroup(null);
    }
  });

  useEffect(() => {
    if (selectedGroup) {
      setSelectedRepoIds(new Set(selectedGroup.instrumentRepoIds));
    }
  }, [selectedGroup?.id]);

  const handleToggleRepo = (repoId: string) => {
    setSelectedRepoIds((prev) => {
      const next = new Set(prev);
      if (next.has(repoId)) {
        next.delete(repoId);
      } else {
        next.add(repoId);
      }
      return next;
    });
  };

  const handleSave = () => {
    if (!selectedGroup) {
      return;
    }
    // The sheet is closed in the mutation's onSuccess so a failed save keeps the user's selection.
    updateGroupReposMutation.mutate({
      groupId: selectedGroup.id,
      instrumentRepoIds: [...selectedRepoIds]
    });
  };

  const handleArchive = () => {
    if (!selectedGroup) {
      // The confirmation lives inside the sheet, so left open it would greet the next group's sheet.
      setIsConfirmArchiveOpen(false);
      return;
    }
    archiveGroupMutation.mutate(
      { id: selectedGroup.id },
      {
        onSuccess: () => {
          setIsConfirmArchiveOpen(false);
          setSelectedGroup(null);
        }
      }
    );
  };

  return (
    <Sheet open={Boolean(selectedGroup)} onOpenChange={() => setSelectedGroup(null)}>
      <PageHeader>
        <Heading className="text-center" variant="h2">
          {t({
            en: 'Manage Groups',
            es: 'Gestionar grupos',
            fr: 'Gérer les groupes'
          })}
        </Heading>
      </PageHeader>
      <DataTable
        columns={[
          {
            accessorKey: 'name',
            cell: (ctx) => {
              const group = ctx.row.original;
              return (
                <span className="flex items-center">
                  {group.name}
                  <span className="hidden" data-row-selected={highlightedRowId === group.id ? 'true' : 'false'} />
                </span>
              );
            },
            header: ({ column }) => <SortableHeader column={column} label={t('common.groupName')} />
          },
          {
            accessorKey: 'type',
            cell: (ctx) => {
              const type = ctx.getValue() as Group['type'];
              const typeLabels: { [K in Group['type']]: string } = {
                CLINICAL: t('common.clinical'),
                RESEARCH: t('common.research')
              };
              return (
                <ColorTagCell
                  color={getGroupTypeColor(type, resolveTheme(theme))}
                  data-testid="group-cell-type"
                  label={typeLabels[type]}
                />
              );
            },
            header: ({ column }) => <SortableHeader column={column} label={t('common.groupType')} />
          },
          {
            // `archivedAt` is nullish, and TanStack sorts `undefined` to the opposite end from `null`, so
            // without one value for every active group, active groups could land on both sides of the archived.
            accessorFn: (group) => group.archivedAt ?? null,
            cell: (ctx) => {
              const { archivedAt } = ctx.row.original;
              if (archivedAt) {
                const date = toBasicISOString(new Date(archivedAt));
                return (
                  <ColorTagCell
                    color={getArchiveStatusColor(true, resolveTheme(theme))}
                    data-testid="group-status-archived"
                    label={t({ en: `Archived on ${date}`, es: `Archivado el ${date}`, fr: `Archivé le ${date}` })}
                  />
                );
              }
              return (
                <ColorTagCell
                  color={getArchiveStatusColor(false, resolveTheme(theme))}
                  data-testid="group-status-active"
                  label={t({ en: 'Active', es: 'Activo', fr: 'Actif' })}
                />
              );
            },
            header: ({ column }) => (
              <SortableHeader column={column} label={t({ en: 'Status', es: 'Estado', fr: 'Statut' })} />
            ),
            id: 'status'
          }
        ]}
        data={groupsQuery.data}
        rowActions={[
          {
            label: t('common.manage'),
            onSelect: setSelectedGroup
          }
        ]}
        togglesComponent={() => (
          <Button asChild variant="outline">
            <Link to="/admin/groups/create">
              {t({
                en: 'Add Group',
                es: 'Agregar grupo',
                fr: 'Ajouter un groupe'
              })}
            </Link>
          </Button>
        )}
        onRowClick={(group) => setHighlightedRowId(group.id)}
        onRowDoubleClick={(group) => {
          setHighlightedRowId(group.id);
          setSelectedGroup(group);
        }}
      />
      <Sheet.Content className="flex flex-col p-0">
        <Dialog open={isConfirmArchiveOpen} onOpenChange={setIsConfirmArchiveOpen}>
          <Sheet.Header className="px-6 pt-6">
            <Sheet.Title>{selectedGroup?.name}</Sheet.Title>
            <Sheet.Description>
              {t({
                en: 'Make changes to this group here. Click save when you are done.',
                es: 'Modifique este grupo aquí. Haga clic en Guardar cuando termine.',
                fr: 'Apportez des modifications à ce groupe ici. Cliquez sur enregistrer lorsque vous avez terminé.'
              })}
            </Sheet.Description>
          </Sheet.Header>
          <Sheet.Body className="grow overflow-y-auto px-6 pb-4">
            <div>
              <h3 className="mb-2 text-sm font-medium">
                {t({
                  en: 'Instrument Repositories',
                  es: 'Repositorios de instrumentos',
                  fr: "Dépôts d'instruments"
                })}
              </h3>
              <p className="text-muted-foreground mb-3 text-xs">
                {t({
                  en: 'Select which instrument repositories this group has access to.',
                  es: 'Seleccione a qué repositorios de instrumentos tiene acceso este grupo.',
                  fr: "Sélectionnez les dépôts d'instruments auxquels ce groupe a accès."
                })}
              </p>
              {reposQuery.data.length === 0 ? (
                <p className="text-muted-foreground text-sm italic">
                  {t({
                    en: 'No instrument repositories available. Add one from the admin menu.',
                    es: 'No hay repositorios de instrumentos disponibles. Agregue uno desde el menú de administración.',
                    fr: "Aucun dépôt d'instruments disponible. Ajoutez-en un depuis le menu admin."
                  })}
                </p>
              ) : (
                <div className="space-y-2">
                  {reposQuery.data.map((repo) => (
                    <div
                      className="flex items-center gap-2 rounded-md border p-3 hover:bg-slate-50 dark:hover:bg-slate-800"
                      key={repo.id}
                    >
                      <Checkbox
                        checked={selectedRepoIds.has(repo.id)}
                        onCheckedChange={() => handleToggleRepo(repo.id)}
                      />
                      <div>
                        <span className="text-sm font-medium">{repo.name}</span>
                        <span className="text-muted-foreground ml-2 text-xs">
                          ({repo.instrumentIds.length} {t({ en: 'instruments', es: 'instrumentos', fr: 'instruments' })}
                          )
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Sheet.Body>
          <div className="border-t px-6 py-4">
            <div className="flex gap-2">
              {selectedGroup?.archivedAt ? (
                <Button
                  className="flex-1"
                  type="button"
                  variant="outline"
                  onClick={() => {
                    unarchiveGroupMutation.mutate(
                      { id: selectedGroup.id },
                      { onSuccess: () => setSelectedGroup(null) }
                    );
                  }}
                >
                  {t({ en: 'Unarchive', es: 'Desarchivar', fr: 'Désarchiver' })}
                </Button>
              ) : (
                <Dialog.Trigger asChild>
                  <Button className="flex-1" type="button" variant="danger">
                    {t({ en: 'Archive', es: 'Archivar', fr: 'Archiver' })}
                  </Button>
                </Dialog.Trigger>
              )}
              <Button className="flex-1" type="button" onClick={handleSave}>
                {t('core.save')}
              </Button>
            </div>
          </div>
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
                  en: 'Members of this group will lose access to it the next time they sign in. Its data is kept, and an administrator can unarchive it at any time.',
                  es: 'Los miembros de este grupo perderán el acceso la próxima vez que inicien sesión. Sus datos se conservan y un administrador puede desarchivarlo en cualquier momento.',
                  fr: 'Les membres de ce groupe y perdront accès à leur prochaine connexion. Ses données sont conservées et un administrateur peut le désarchiver à tout moment.'
                })}
              </Dialog.Description>
            </Dialog.Header>
            <Dialog.Footer>
              <Button
                className="min-w-16"
                data-testid="confirm-archive-group"
                type="button"
                variant="danger"
                onClick={handleArchive}
              >
                {t('core.yes')}
              </Button>
              <Button
                className="min-w-16"
                type="button"
                variant="outline"
                onClick={() => setIsConfirmArchiveOpen(false)}
              >
                {t('core.no')}
              </Button>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog>
      </Sheet.Content>
    </Sheet>
  );
};

export const Route = createFileRoute('/_app/admin/groups/')({
  component: RouteComponent,
  // Prefetch both: the component reads repos via a suspense query, so ensure it here to avoid a
  // render-time fetch waterfall.
  loader: async ({ context }) => {
    await Promise.all([
      context.queryClient.ensureQueryData(groupsQueryOptions()),
      context.queryClient.ensureQueryData(instrumentReposQueryOptions())
    ]);
  }
});
