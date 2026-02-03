import { useState } from 'react';

import { Button, DataTable, Heading, Sheet } from '@douglasneuroinformatics/libui/components';
import { useTranslation } from '@douglasneuroinformatics/libui/hooks';
import type { Group } from '@opendatacapture/schemas/group';
import { createFileRoute, Link } from '@tanstack/react-router';

import { PageHeader } from '@/components/PageHeader';
import { useDeleteGroupMutation } from '@/hooks/useDeleteGroupMutation';
import { groupsQueryOptions, useGroupsQuery } from '@/hooks/useGroupsQuery';

const RouteComponent = () => {
  const { t } = useTranslation();
  const groupsQuery = useGroupsQuery();
  const deleteGroupMutation = useDeleteGroupMutation();
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);

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
      />
      <Sheet.Content>
        <Sheet.Header>
          <Sheet.Title>{selectedGroup?.name}</Sheet.Title>
          <Sheet.Description>
            {t({
              en: 'Make changes to this group here. Click save when you are done.',
              fr: 'Apportez des modifications à ce groupe ici. Cliquez sur enregistrer lorsque vous avez terminé.'
            })}
          </Sheet.Description>
        </Sheet.Header>
        <Sheet.Body className="grid gap-4"></Sheet.Body>
        <Sheet.Footer>
          <Button
            className="w-full"
            type="button"
            variant="danger"
            onClick={() => {
              deleteGroupMutation.mutate({ id: selectedGroup!.id });
              setSelectedGroup(null);
            }}
          >
            {t('core.delete')}
          </Button>
          <Sheet.Close asChild>
            <Button disabled className="w-full" type="submit">
              {t('core.save')}
            </Button>
          </Sheet.Close>
        </Sheet.Footer>
      </Sheet.Content>
    </Sheet>
  );
};

export const Route = createFileRoute('/_app/admin/groups/')({
  component: RouteComponent,
  loader: ({ context }) => context.queryClient.ensureQueryData(groupsQueryOptions())
});
