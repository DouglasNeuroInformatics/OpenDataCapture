import { useEffect, useState } from 'react';

import { snakeToCamelCase } from '@douglasneuroinformatics/libjs';
import { Button, ClientTable, Heading, SearchBar, Sheet } from '@douglasneuroinformatics/libui/components';
import { useTranslation } from '@douglasneuroinformatics/libui/hooks';
import type { User } from '@opendatacapture/schemas/user';
import { Link } from 'react-router-dom';

import { PageHeader } from '@/components/PageHeader';
import { useAppStore } from '@/store';

import { useDeleteUserMutation } from '../hooks/useDeleteUserMutation';
import { useUsersQuery } from '../hooks/useUsersQuery';

// eslint-disable-next-line max-lines-per-function
export const ManageUsersPage = () => {
  const currentUser = useAppStore((store) => store.currentUser);
  const { t } = useTranslation();
  const usersQuery = useUsersQuery();
  const deleteUserMutation = useDeleteUserMutation();
  const [users, setUsers] = useState<User[]>(usersQuery.data ?? []);
  const [selectedUser, setSelectedUser] = useState<null | User>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    setUsers((usersQuery.data ?? []).filter((user) => user.username.toLowerCase().includes(searchTerm.toLowerCase())));
  }, [usersQuery.data, searchTerm]);

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
        data={users}
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
        <Sheet.Body className="grid gap-4"></Sheet.Body>
        <Sheet.Footer>
          <Button
            className="w-full"
            disabled={currentUserIsSelected}
            type="button"
            variant="danger"
            onClick={() => {
              deleteUserMutation.mutate({ id: selectedUser!.id });
              setSelectedUser(null);
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
