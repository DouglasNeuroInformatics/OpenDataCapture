import { useState } from 'react';

import { snakeToCamelCase } from '@douglasneuroinformatics/libjs';
import { Button, ClientTable, Form, Heading, SearchBar, Sheet } from '@douglasneuroinformatics/libui/components';
import { useTranslation } from '@douglasneuroinformatics/libui/hooks';
import { $UpdateUserData, type User } from '@opendatacapture/schemas/user';
import { Link } from 'react-router-dom';

import { PageHeader } from '@/components/PageHeader';
import { useSearch } from '@/hooks/useSearch';
import { useAppStore } from '@/store';

import { useDeleteUserMutation } from '../hooks/useDeleteUserMutation';
import { useUpdateUserMutation } from '../hooks/useUpdateUserMutation';
import { useUsersQuery } from '../hooks/useUsersQuery';

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
          <Form
            additionalButtons={{
              left: (
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
              )
            }}
            content={[
              {
                description: t({
                  en: 'IMPORTANT: These permissions are not specific to any group. To manage granular permissions, please use the API.',
                  fr: "IMPORTANT : Ces autorisations ne sont pas spécifiques à un groupe. Pour gérer des autorisations granulaires, veuillez utiliser l'API."
                }),
                fields: {
                  additionalPermissions: {
                    fieldset: {
                      action: {
                        kind: 'string',
                        label: t({
                          en: 'Action',
                          fr: 'Action'
                        }),
                        options: {
                          create: t({
                            en: 'Create',
                            fr: 'Créer'
                          }),
                          delete: t({
                            en: 'Delete',
                            fr: 'Effacer'
                          }),
                          manage: t({
                            en: 'Manage (All)',
                            fr: 'Gérer (Tout)'
                          }),
                          read: t({
                            en: 'Read',
                            fr: 'Lire'
                          }),
                          update: t({
                            en: 'Update',
                            fr: 'Mettre à jour'
                          })
                        },
                        variant: 'select'
                      },
                      subject: {
                        kind: 'string',
                        label: t({
                          en: 'Resource',
                          fr: 'Resource'
                        }),
                        options: {
                          all: t({
                            en: 'All',
                            fr: 'Tous'
                          }),
                          Assignment: t({
                            en: 'Assignment',
                            fr: 'Devoir'
                          }),
                          Group: t({
                            en: 'Group',
                            fr: 'Groupe'
                          }),
                          Instrument: t({
                            en: 'Instrument',
                            fr: 'Instrument'
                          }),
                          InstrumentRecord: t({
                            en: 'Instrument Record',
                            fr: "Enregistrement de l'instrument"
                          }),
                          Session: t({
                            en: 'Session',
                            fr: 'Session'
                          }),
                          Subject: t({
                            en: 'Subject',
                            fr: 'Client'
                          }),
                          User: t({
                            en: 'User',
                            fr: 'Utilisateur'
                          })
                        },
                        variant: 'select'
                      }
                    },
                    kind: 'record-array',
                    label: t({
                      en: 'Permission',
                      fr: 'Autorisations supplémentaires'
                    })
                  }
                },
                title: t({
                  en: 'Authorization',
                  fr: 'Autorisation'
                })
              }
            ]}
            initialValues={
              selectedUser?.additionalPermissions.length
                ? {
                    additionalPermissions: selectedUser.additionalPermissions
                  }
                : undefined
            }
            submitBtnLabel={t('core.save')}
            validationSchema={$UpdateUserData.pick({ additionalPermissions: true }).required()}
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
