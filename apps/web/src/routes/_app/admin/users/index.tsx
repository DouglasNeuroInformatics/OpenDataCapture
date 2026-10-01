import React, { useState } from 'react';

import { snakeToCamelCase } from '@douglasneuroinformatics/libjs';
import { Button, DataTable, Dialog, Heading } from '@douglasneuroinformatics/libui/components';
import { useTranslation } from '@douglasneuroinformatics/libui/hooks';
import type { User } from '@opendatacapture/schemas/user';
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';

import { PageHeader } from '@/components/PageHeader';
import { useArchiveUserMutation } from '@/hooks/useArchiveUserMutation';
import { useAppStore } from '@/store';
import { usersQueryOptions, useUsersQuery } from '@/hooks/useUsersQuery';

const RouteComponent = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const usersQuery = useUsersQuery();
  const archiveUserMutation = useArchiveUserMutation();
  const currentUser = useAppStore((store) => store.currentUser);
  const [highlightedRowId, setHighlightedRowId] = useState<null | string>(null);
  const [userToArchive, setUserToArchive] = useState<User | null>(null);

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
            header: t('common.username')
          },
          {
            accessorKey: 'basePermissionLevel',
            cell: (ctx) => {
              const basePermissionLevel = ctx.getValue() as User['basePermissionLevel'];
              if (!basePermissionLevel) {
                return t({
                  en: 'None',
                  fr: 'Aucune'
                });
              }
              return t(`common.${snakeToCamelCase(basePermissionLevel)}`);
            },
            header: t('common.basePermissionLevel')
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
            disabled: (user) => user.username === currentUser?.username,
            label: t({ en: 'Archive', es: 'Archivar', fr: 'Archiver' }),
            onSelect: (user) => setUserToArchive(user)
          }
        ]}
        togglesComponent={() => (
          <Button variant="outline">
            <Link to="/admin/users/create">
              {t({
                en: 'Add User',
                fr: 'Ajouter un utilisateur'
              })}
            </Link>
          </Button>
        )}
        onRowClick={(user) => setHighlightedRowId(user.id)}
        onRowDoubleClick={openUser}
      />
      <Dialog
        open={userToArchive !== null}
        onOpenChange={(open) => {
          if (!open) setUserToArchive(null);
        }}
      >
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
                if (userToArchive) {
                  archiveUserMutation.mutate({ id: userToArchive.id }, { onSuccess: () => setUserToArchive(null) });
                }
              }}
            >
              {t('core.yes')}
            </Button>
            <Button className="min-w-16" type="button" variant="outline" onClick={() => setUserToArchive(null)}>
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
