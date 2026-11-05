import React, { useState } from 'react';

import { Button, DataTable, Heading } from '@douglasneuroinformatics/libui/components';
import { useTranslation } from '@douglasneuroinformatics/libui/hooks';
import type { PermissionSetSummary } from '@opendatacapture/schemas/permission-set';
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';

import { InstanceCard } from '@/components/InstanceCard';
import { PageHeader } from '@/components/PageHeader';
import { TruncatedCell } from '@/components/TruncatedCell';
import { useConfirmPermissionSetDeletion } from '@/hooks/useConfirmPermissionSetDeletion';
import { permissionSetsQueryOptions, usePermissionSetsQuery } from '@/hooks/usePermissionSetsQuery';

const RouteComponent = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const permissionSetsQuery = usePermissionSetsQuery();
  const confirmDeletion = useConfirmPermissionSetDeletion();
  const [highlightedRowId, setHighlightedRowId] = useState<null | string>(null);

  const handleOpenPermissionSet = (permissionSet: PermissionSetSummary) => {
    setHighlightedRowId(permissionSet.id);
    void navigate({ params: { permissionSetId: permissionSet.id }, to: '/admin/permission-sets/$permissionSetId' });
  };

  return (
    <React.Fragment>
      <PageHeader>
        <Heading className="text-center" variant="h2">
          {t({
            en: 'Manage Permission Sets',
            es: 'Gestionar conjuntos de permisos',
            fr: "Gérer les ensembles d'autorisations"
          })}
        </Heading>
      </PageHeader>
      <InstanceCard className="p-6">
        <DataTable
          columns={[
            {
              accessorKey: 'name',
              cell: (ctx) => {
                const permissionSet = ctx.row.original;
                return (
                  <span className="flex items-center overflow-hidden">
                    <TruncatedCell
                      data-testid="permission-set-name"
                      title={permissionSet.name}
                      value={permissionSet.name}
                    />
                    <span
                      className="hidden"
                      data-row-selected={highlightedRowId === permissionSet.id ? 'true' : 'false'}
                    />
                  </span>
                );
              },
              header: t({ en: 'Name', es: 'Nombre', fr: 'Nom' })
            },
            {
              accessorFn: (permissionSet) => permissionSet.rules.length,
              header: t({ en: 'Rules', es: 'Reglas', fr: 'Règles' }),
              id: 'ruleCount'
            },
            {
              accessorKey: 'holderCount',
              cell: ({ row }) => <span data-testid="permission-set-holder-count">{row.original.holderCount}</span>,
              header: t({ en: 'Holders', es: 'Titulares', fr: 'Titulaires' })
            }
          ]}
          data={permissionSetsQuery.data}
          emptyStateProps={{
            description: t({
              en: 'A permission set bundles grants an administrator can then give users in one step.',
              es: 'Un conjunto de permisos agrupa permisos que un administrador puede luego dar a los usuarios en un solo paso.',
              fr: "Un ensemble d'autorisations regroupe des autorisations qu'un administrateur peut ensuite donner aux utilisateurs en une seule étape."
            }),
            title: t({
              en: 'No permission sets yet',
              es: 'Todavía no hay conjuntos de permisos',
              fr: "Aucun ensemble d'autorisations pour l'instant"
            })
          }}
          rowActions={[
            {
              label: t('common.manage'),
              onSelect: handleOpenPermissionSet
            },
            {
              label: t('core.delete'),
              onSelect: (permissionSet) => confirmDeletion(permissionSet)
            }
          ]}
          togglesComponent={() => (
            <Button asChild variant="outline">
              <Link data-testid="create-permission-set" to="/admin/permission-sets/create">
                {t({
                  en: 'Add Permission Set',
                  es: 'Agregar un conjunto de permisos',
                  fr: "Ajouter un ensemble d'autorisations"
                })}
              </Link>
            </Button>
          )}
          onRowClick={(permissionSet) => setHighlightedRowId(permissionSet.id)}
          onRowDoubleClick={handleOpenPermissionSet}
        />
      </InstanceCard>
    </React.Fragment>
  );
};

export const Route = createFileRoute('/_app/admin/permission-sets/')({
  component: RouteComponent,
  loader: async ({ context }) => {
    await context.queryClient.ensureQueryData(permissionSetsQueryOptions());
  }
});
