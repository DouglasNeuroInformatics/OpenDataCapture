import { useState } from 'react';

import { snakeToCamelCase } from '@douglasneuroinformatics/libjs';
import { Button, ClientTable, Heading, SearchBar, Sheet } from '@douglasneuroinformatics/libui/components';
import { useTranslation } from '@douglasneuroinformatics/libui/hooks';
import type { User } from '@opendatacapture/schemas/user';
import { Link } from 'react-router-dom';

import { PageHeader } from '@/components/PageHeader';
import { useSearch } from '@/hooks/useSearch';
import { useAppStore } from '@/store';

import { useDeleteUserMutation } from '../hooks/useDeleteUserMutation';
import { useUpdateUserMutation } from '../hooks/useUpdateUserMutation';
import { useUsersQuery } from '../hooks/useUsersQuery';
import { UpdateUserForm } from './UpdateUserForm';

export const ManageUsersPage = () => {
  const currentUser = useAppStore((store) => store.currentUser);
  const { t } = useTranslation();
  const usersQuery = useUsersQuery();
  const deleteUserMutation = useDeleteUserMutation();
  const updateUserMutation = useUpdateUserMutation();
  const [selectedUser, setSelectedUser] = useState<null | User>(null);
  const { filteredData, searchTerm, setSearchTerm } = useSearch(usersQuery.data ?? [], 'username');

  const currentUserIsSelected = selectedUser?.username === currentUser?.username;

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
      <Sheet.Content>
        <Sheet.Header>
          <Sheet.Title>{selectedUser?.username}</Sheet.Title>
          <Sheet.Description>
            {t({
              en: 'Make changes to this user here. Click save when you are done.',
              fr: 'Apportez des modifications à cet utilisateur ici. Cliquez sur enregistrer lorsque vous avez terminé.'
            })}
          </Sheet.Description>
        </Sheet.Header>
        <Sheet.Body className="grid gap-4">
          <UpdateUserForm
            disableDelete={currentUserIsSelected}
            initialValues={
              selectedUser?.additionalPermissions.length
                ? {
                    additionalPermissions: selectedUser.additionalPermissions
                  }
                : undefined
            }
            onDelete={() => {
              deleteUserMutation.mutate({ id: selectedUser!.id });
              setSelectedUser(null);
            }}
            onSubmit={(data) => {
              void updateUserMutation.mutateAsync({ data, id: selectedUser!.id }).then(() => {
                setSelectedUser(null);
              });
            }}
          />
        </Sheet.Body>
      </Sheet.Content>
    </Sheet>
  );
};
