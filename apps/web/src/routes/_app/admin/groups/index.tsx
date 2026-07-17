import React, { useCallback, useEffect, useState } from 'react';

import { Button, Checkbox, DataTable, Dialog, Heading, Sheet } from '@douglasneuroinformatics/libui/components';
import { useNotificationsStore, useTranslation } from '@douglasneuroinformatics/libui/hooks';
import { $Group } from '@opendatacapture/schemas/group';
import type { Group } from '@opendatacapture/schemas/group';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createFileRoute, Link } from '@tanstack/react-router';
import axios from 'axios';

import { PageHeader } from '@/components/PageHeader';
import { useDeleteGroupMutation } from '@/hooks/useDeleteGroupMutation';
import { GROUPS_QUERY_KEY, groupsQueryOptions, useGroupsQuery } from '@/hooks/useGroupsQuery';
import {
  INSTRUMENT_REPOS_QUERY_KEY,
  instrumentReposQueryOptions,
  useInstrumentReposQuery
} from '@/hooks/useInstrumentReposQuery';
import { getApiErrorMessage } from '@/utils/error';

const RouteComponent = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const addNotification = useNotificationsStore((store) => store.addNotification);
  const groupsQuery = useGroupsQuery();
  const deleteGroupMutation = useDeleteGroupMutation();
  const reposQuery = useInstrumentReposQuery();
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [selectedRepoIds, setSelectedRepoIds] = useState<Set<string>>(new Set());
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
  const handleRowHighlight = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const row = (e.target as HTMLElement).closest<HTMLElement>('[data-testid="data-table-row"]');
    if (!row) return;
    const body = row.closest('[data-testid="data-table-body"]');
    if (!body) return;
    for (const r of body.querySelectorAll<HTMLElement>('[data-testid="data-table-row"]')) {
      r.style.backgroundColor = '';
    }
    row.style.backgroundColor = 'var(--color-accent)';
  }, []);

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
          t({ en: 'Failed to update group repositories', fr: 'Échec de la mise à jour des dépôts du groupe' })
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
    if (!selectedGroup) return;
    // The sheet is closed in the mutation's onSuccess so a failed save keeps the user's selection.
    updateGroupReposMutation.mutate({
      groupId: selectedGroup.id,
      instrumentRepoIds: [...selectedRepoIds]
    });
  };

  return (
    <Sheet open={Boolean(selectedGroup)} onOpenChange={() => setSelectedGroup(null)}>
      <PageHeader>
        <Heading className="text-center" variant="h2">
          {t({
            en: 'Manage Groups',
            fr: 'Gérer les groupes'
          })}
        </Heading>
      </PageHeader>
      <div onClick={handleRowHighlight}>
        <DataTable
          columns={[
            {
              accessorKey: 'name',
              header: t('common.groupName')
            },
            {
              accessorKey: 'type',
              cell: (ctx) => {
                const type = ctx.getValue() as Group['type'];
                if (type === 'CLINICAL') {
                  return t('common.clinical');
                } else if (type === 'RESEARCH') {
                  return t('common.research');
                }
                return type satisfies never;
              },
              header: t('common.groupType')
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
                  fr: 'Ajouter un groupe'
                })}
              </Link>
            </Button>
          )}
          onRowClick={() => {}}
          onRowDoubleClick={(group) => {
            setSelectedGroup(group);
          }}
        />
      </div>
      <Sheet.Content className="flex flex-col p-0">
        <Dialog open={isConfirmDeleteOpen} onOpenChange={setIsConfirmDeleteOpen}>
          <Sheet.Header className="px-6 pt-6">
            <Sheet.Title>{selectedGroup?.name}</Sheet.Title>
            <Sheet.Description>
              {t({
                en: 'Make changes to this group here. Click save when you are done.',
                fr: 'Apportez des modifications à ce groupe ici. Cliquez sur enregistrer lorsque vous avez terminé.'
              })}
            </Sheet.Description>
          </Sheet.Header>
          <Sheet.Body className="grow overflow-y-auto px-6 pb-4">
            <div>
              <h3 className="mb-2 text-sm font-medium">
                {t({
                  en: 'Instrument Repositories',
                  fr: "Dépôts d'instruments"
                })}
              </h3>
              <p className="text-muted-foreground mb-3 text-xs">
                {t({
                  en: 'Select which instrument repositories this group has access to.',
                  fr: "Sélectionnez les dépôts d'instruments auxquels ce groupe a accès."
                })}
              </p>
              {reposQuery.data.length === 0 ? (
                <p className="text-muted-foreground text-sm italic">
                  {t({
                    en: 'No instrument repositories available. Add one from the admin menu.',
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
                          ({repo.instrumentIds.length} {t({ en: 'instruments', fr: 'instruments' })})
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
              <Dialog.Trigger asChild>
                <Button className="flex-1" type="button" variant="danger">
                  {t('core.delete')}
                </Button>
              </Dialog.Trigger>
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
                  fr: 'Êtes-vous absolument sûr ?'
                })}
              </Dialog.Title>
              <Dialog.Description>
                {t({
                  en: 'This action will permanently delete this group and cannot be undone.',
                  fr: 'Cette action supprimera définitivement ce groupe et ne pourra pas être annulée.'
                })}
              </Dialog.Description>
            </Dialog.Header>
            <Dialog.Footer>
              <Button
                className="min-w-16"
                type="button"
                variant="danger"
                onClick={() => {
                  deleteGroupMutation.mutate({ id: selectedGroup!.id });
                  setIsConfirmDeleteOpen(false);
                  setSelectedGroup(null);
                }}
              >
                {t('core.yes')}
              </Button>
              <Button
                className="min-w-16"
                type="button"
                variant="outline"
                onClick={() => setIsConfirmDeleteOpen(false)}
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
