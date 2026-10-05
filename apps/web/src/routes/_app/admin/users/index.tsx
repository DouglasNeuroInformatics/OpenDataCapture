import React, { useState } from 'react';

import { snakeToCamelCase, toBasicISOString } from '@douglasneuroinformatics/libjs';
import { Button, DataTable, Dialog, Heading } from '@douglasneuroinformatics/libui/components';
import type { TanstackTable } from '@douglasneuroinformatics/libui/components';
import { useTranslation } from '@douglasneuroinformatics/libui/hooks';
import { cn } from '@douglasneuroinformatics/libui/utils';
import type { User } from '@opendatacapture/schemas/user';
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { ChevronDownIcon, ChevronsUpDownIcon, ChevronUpIcon } from 'lucide-react';

import { PageHeader } from '@/components/PageHeader';
import { useArchiveUserMutation } from '@/hooks/useArchiveUserMutation';
import { useUnarchiveUserMutation } from '@/hooks/useUnarchiveUserMutation';
import { usersQueryOptions, useUsersQuery } from '@/hooks/useUsersQuery';
import { useAppStore } from '@/store';

type ArchiveAction = { kind: 'archive'; user: User };

const SortableHeader = ({ column, label }: { column: TanstackTable.Column<User>; label: string }) => {
  const sorted = column.getIsSorted();
  const Icon = sorted === 'asc' ? ChevronUpIcon : sorted === 'desc' ? ChevronDownIcon : ChevronsUpDownIcon;
  return (
    <button
      className="hover:text-foreground flex items-center gap-1 transition-colors"
      type="button"
      onClick={() => column.toggleSorting()}
    >
      {label}
      <Icon className={cn('h-3.5 w-3.5', !sorted && 'opacity-40')} />
    </button>
  );
};

const RouteComponent = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const usersQuery = useUsersQuery();
  const archiveUserMutation = useArchiveUserMutation();
  const unarchiveUserMutation = useUnarchiveUserMutation();
  const currentUser = useAppStore((store) => store.currentUser);
  const [highlightedRowId, setHighlightedRowId] = useState<null | string>(null);
  const [pendingAction, setPendingAction] = useState<ArchiveAction | null>(null);

  const openUser = (user: User) => {
    setHighlightedRowId(user.id);
    void navigate({ params: { userId: user.id }, to: '/admin/users/$userId' });
  };

  return (
    <React.Fragment>
      <PageHeader>
        <Heading className="text-center" variant="h2">
          {t({
            en: 'Manage Users',
            es: 'Gestionar usuarios',
            fr: 'Gérer les utilisateurs'
          })}
        </Heading>
      </PageHeader>
      <DataTable
        columns={[
          {
            accessorKey: 'username',
            cell: (ctx) => {
              const user = ctx.row.original;
              return (
                <span className="flex items-center">
                  {user.username}
                  <span className="hidden" data-row-selected={highlightedRowId === user.id ? 'true' : 'false'} />
                </span>
              );
            },
            header: ({ column }) => <SortableHeader column={column} label={t('common.username')} />
          },
          {
            accessorKey: 'basePermissionLevel',
            cell: (ctx) => {
              const basePermissionLevel = ctx.getValue() as User['basePermissionLevel'];
              if (!basePermissionLevel) {
                return t({
                  en: 'None',
                  es: 'Ninguno',
                  fr: 'Aucune'
                });
              }
              return t(`common.${snakeToCamelCase(basePermissionLevel)}`);
            },
            header: ({ column }) => <SortableHeader column={column} label={t('common.basePermissionLevel')} />
          },
          {
            accessorFn: (user) => Boolean(user.disabled),
            cell: ({ row }) => (
              <span data-testid="user-login-status">
                {row.original.disabled
                  ? t({ en: 'Disabled', es: 'Desactivado', fr: 'Désactivé' })
                  : t({ en: 'Enabled', es: 'Activado', fr: 'Activé' })}
              </span>
            ),
            header: ({ column }) => (
              <SortableHeader
                column={column}
                label={t({ en: 'Enabled / Disabled', es: 'Activado / Desactivado', fr: 'Activé / Désactivé' })}
              />
            ),
            id: 'disabled'
          },
          {
            accessorKey: 'archivedAt',
            cell: (ctx) => {
              const user = ctx.row.original;
              if (user.archivedAt) {
                return (
                  <span className="text-destructive" data-testid="user-status-archived">
                    {t({
                      en: `Archived on ${toBasicISOString(new Date(user.archivedAt))}`,
                      es: `Archivado el ${toBasicISOString(new Date(user.archivedAt))}`,
                      fr: `Archivé le ${toBasicISOString(new Date(user.archivedAt))}`
                    })}
                  </span>
                );
              }
              return (
                <span className="text-emerald-600 dark:text-emerald-400" data-testid="user-status-active">
                  {t({ en: 'Active', es: 'Activo', fr: 'Actif' })}
                </span>
              );
            },
            header: ({ column }) => (
              <SortableHeader column={column} label={t({ en: 'Status', es: 'Estado', fr: 'Statut' })} />
            ),
            id: 'status'
          }
        ]}
        data={usersQuery.data}
        data-testid="admin-users-table"
        rowActions={[
          {
            label: t('common.manage'),
            onSelect: openUser
          },
          {
            disabled: (user) => user.username === currentUser?.username || Boolean(user.archivedAt),
            label: t({ en: 'Archive', es: 'Archivar', fr: 'Archiver' }),
            onSelect: (user) => setPendingAction({ kind: 'archive', user })
          },
          {
            disabled: (user) => !user.archivedAt,
            label: t({ en: 'Unarchive', es: 'Desarchivar', fr: 'Désarchiver' }),
            onSelect: (user) => unarchiveUserMutation.mutate({ id: user.id })
          }
        ]}
        togglesComponent={() => (
          <Button variant="outline">
            <Link to="/admin/users/create">
              {t({
                en: 'Add User',
                es: 'Agregar usuario',
                fr: 'Ajouter un utilisateur'
              })}
            </Link>
          </Button>
        )}
        onRowClick={(user) => setHighlightedRowId(user.id)}
        onRowDoubleClick={openUser}
      />
      <Dialog open={pendingAction !== null} onOpenChange={() => setPendingAction(null)}>
        <Dialog.Content>
          <Dialog.Header>
            <Dialog.Title>
              {t({
                en: 'Are you absolutely sure?',
                es: '¿Está absolutamente seguro?',
                fr: 'Êtes-vous absolument sûr ?'
              })}
            </Dialog.Title>
            <Dialog.Description>
              {t({
                en: 'This will archive the account and prevent the user from signing in.',
                es: 'Esto archivará la cuenta e impedirá que el usuario inicie sesión.',
                fr: "Cela archivera le compte et empêchera l'utilisateur de se connecter."
              })}
            </Dialog.Description>
          </Dialog.Header>
          <Dialog.Footer>
            <Button
              className="min-w-16"
              data-testid="confirm-archive-user"
              type="button"
              variant="danger"
              onClick={() => {
                if (!pendingAction) return;
                archiveUserMutation.mutate({ id: pendingAction.user.id }, { onSuccess: () => setPendingAction(null) });
              }}
            >
              {t('core.yes')}
            </Button>
            <Button className="min-w-16" type="button" variant="outline" onClick={() => setPendingAction(null)}>
              {t('core.no')}
            </Button>
          </Dialog.Footer>
        </Dialog.Content>
      </Dialog>
    </React.Fragment>
  );
};

export const Route = createFileRoute('/_app/admin/users/')({
  component: RouteComponent,
  loader: async ({ context }) => {
    await context.queryClient.ensureQueryData(usersQueryOptions());
  }
});
