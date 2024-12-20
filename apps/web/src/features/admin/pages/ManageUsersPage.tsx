import { useEffect, useState } from 'react';

import { snakeToCamelCase } from '@douglasneuroinformatics/libjs';
import { Button, ClientTable, Heading, SearchBar, Sheet } from '@douglasneuroinformatics/libui/components';
import { useTranslation } from '@douglasneuroinformatics/libui/hooks';
import type { User } from '@opendatacapture/schemas/user';
import { Link } from 'react-router-dom';

import { PageHeader } from '@/components/PageHeader';
import { WithFallback } from '@/components/WithFallback';
import { useSearch } from '@/hooks/useSearch';
import { useAppStore } from '@/store';

import { useDeleteUserMutation } from '../hooks/useDeleteUserMutation';
import { useGroupsQuery } from '../hooks/useGroupsQuery';
import { useUpdateUserMutation } from '../hooks/useUpdateUserMutation';
import { useUsersQuery } from '../hooks/useUsersQuery';
import { UpdateUserForm, type UpdateUserFormInputData } from './UpdateUserForm';

export const ManageUsersPage = () => {
  const currentUser = useAppStore((store) => store.currentUser);
  const { t } = useTranslation();
  const groupsQuery = useGroupsQuery();
  const usersQuery = useUsersQuery();
  const deleteUserMutation = useDeleteUserMutation();
  const updateUserMutation = useUpdateUserMutation();
  const [selectedUser, setSelectedUser] = useState<null | User>(null);
  const { filteredData, searchTerm, setSearchTerm } = useSearch(usersQuery.data ?? [], 'username');

  const [data, setData] = useState<null | UpdateUserFormInputData>(null);

  useEffect(() => {
    const groups = groupsQuery.data;
    if (!selectedUser || !groups) {
      setData(null);
    } else {
      setData({
        disableDelete: selectedUser?.username === currentUser?.username,
        groupOptions: Object.fromEntries(groups.map((group) => [group.id, group.name])),
        initialValues: selectedUser?.additionalPermissions.length
          ? {
              additionalPermissions: selectedUser.additionalPermissions
            }
          : undefined
      });
    }
  }, [groupsQuery.data, selectedUser]);

  return (
    <Sheet open={Boolean(selectedUser)} onOpenChange={() => setSelectedUser(null)}>
      <PageHeader>
        <Heading className="text-center" variant="h2">
          {t({
            en: 'Manage Users',
            fr: 'Gérer les utilisateurs'
          })}
        </Heading>
      </PageHeader>
      <div className="mb-3 flex gap-3">
        <SearchBar
          className="flex-grow"
          placeholder={t({
            en: 'Search by Username',
            fr: "Recherche par nom d'utilisateur"
          })}
          value={searchTerm}
          onValueChange={setSearchTerm}
        />
        <Button variant="outline">
          <Link to="create">
            {t({
              en: 'Add User',
              fr: 'Ajouter un utilisateur'
            })}
          </Link>
        </Button>
      </div>
      <ClientTable<User>
        columns={[
          {
            field: 'username',
            label: t('common.username')
          },
          {
            field: ({ basePermissionLevel }) => {
              if (!basePermissionLevel) {
                return t({
                  en: 'None',
                  fr: 'Aucune'
                });
              }
              return t(`common.${snakeToCamelCase(basePermissionLevel)}`);
            },
            label: t('common.basePermissionLevel')
          }
        ]}
        data={filteredData}
        entriesPerPage={15}
        minRows={15}
        onEntryClick={setSelectedUser}
      />
      <Sheet.Content className="flex flex-col p-0">
        <Sheet.Header className="px-6 pt-6">
          <Sheet.Title>{selectedUser?.username}</Sheet.Title>
          <Sheet.Description>
            {t({
              en: 'Make changes to this user here. Click save when you are done.',
              fr: 'Apportez des modifications à cet utilisateur ici. Cliquez sur enregistrer lorsque vous avez terminé.'
            })}
          </Sheet.Description>
        </Sheet.Header>
        <Sheet.Body className="flex-grow overflow-y-scroll px-6 pb-6">
          <WithFallback
            Component={UpdateUserForm}
            minDelay={1000}
            props={{
              data,
              onDelete: () => {
                deleteUserMutation.mutate({ id: selectedUser!.id });
                setSelectedUser(null);
              },
              onSubmit: ({ groupIds, ...data }) => {
                void updateUserMutation
                  .mutateAsync({ data: { groupIds: Array.from(groupIds), ...data }, id: selectedUser!.id })
                  .then(() => {
                    setSelectedUser(null);
                  });
              }
            }}
          />
        </Sheet.Body>
      </Sheet.Content>
    </Sheet>
  );
};
