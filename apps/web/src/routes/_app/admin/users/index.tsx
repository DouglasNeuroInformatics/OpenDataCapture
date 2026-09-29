import React, { useState } from 'react';

import { snakeToCamelCase } from '@douglasneuroinformatics/libjs';
import { Button, DataTable, Heading } from '@douglasneuroinformatics/libui/components';
import { useTranslation } from '@douglasneuroinformatics/libui/hooks';
import type { User } from '@opendatacapture/schemas/user';
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';

import { PageHeader } from '@/components/PageHeader';
import { usersQueryOptions, useUsersQuery } from '@/hooks/useUsersQuery';

const RouteComponent = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const usersQuery = useUsersQuery();
  const [highlightedRowId, setHighlightedRowId] = useState<null | string>(null);

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
    </React.Fragment>
  );
};

export const Route = createFileRoute('/_app/admin/users/')({
  component: RouteComponent,
  loader: async ({ context }) => {
    await context.queryClient.ensureQueryData(usersQueryOptions());
  }
});
