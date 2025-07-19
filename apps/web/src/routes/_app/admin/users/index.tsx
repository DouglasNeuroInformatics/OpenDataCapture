import React, { useEffect, useMemo, useState } from 'react';

import { isAllUndefined, snakeToCamelCase } from '@douglasneuroinformatics/libjs';
import { estimatePasswordStrength } from '@douglasneuroinformatics/libpasswd';
import {
  Button,
  ClientTable,
  Dialog,
  Form,
  Heading,
  SearchBar,
  Sheet
} from '@douglasneuroinformatics/libui/components';
import { useTranslation } from '@douglasneuroinformatics/libui/hooks';
import type { FormTypes } from '@opendatacapture/runtime-core';
import { $UserPermission } from '@opendatacapture/schemas/core';
import type { UserPermission } from '@opendatacapture/schemas/core';
import type { User } from '@opendatacapture/schemas/user';
import { createFileRoute, Link } from '@tanstack/react-router';
import type { Promisable } from 'type-fest';
import { z } from 'zod/v4';

import { PageHeader } from '@/components/PageHeader';
import { WithFallback } from '@/components/WithFallback';
import { useDeleteUserMutation } from '@/hooks/useDeleteUserMutation';
import { groupsQueryOptions, useGroupsQuery } from '@/hooks/useGroupsQuery';
import { useSearch } from '@/hooks/useSearch';
import { useUpdateUserMutation } from '@/hooks/useUpdateUserMutation';
import { usersQueryOptions, useUsersQuery } from '@/hooks/useUsersQuery';
import { useAppStore } from '@/store';

type UpdateUserFormData = {
  additionalPermissions?: Partial<UserPermission>[];
  confirmPassword?: string | undefined;
  groupIds: Set<string>;
  password?: string | undefined;
};

type UpdateUserFormInputData = {
  disableDelete: boolean;
  groupOptions: {
    [id: string]: string;
  };
  initialValues?: FormTypes.PartialNullableData<UpdateUserFormData>;
};

const UpdateUserForm: React.FC<{
  data: UpdateUserFormInputData;
  onDelete: () => void;
  onSubmit: (data: UpdateUserFormData & { additionalPermissions?: UserPermission[] }) => Promisable<void>;
}> = ({ data, onDelete, onSubmit }) => {
  const { disableDelete, groupOptions, initialValues } = data;
  const { resolvedLanguage, t } = useTranslation();
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);

  const $UpdateUserFormData = useMemo(() => {
    return z
      .object({
        additionalPermissions: z.array($UserPermission.partial()).optional(),
        groupIds: z.set(z.string()),
        password: z.string().min(1).optional()
      })
      .transform((arg) => {
        const firstPermission = arg.additionalPermissions?.[0];
        if (firstPermission && isAllUndefined(firstPermission)) {
          arg.additionalPermissions?.pop();
        }
        return arg;
      })
      .check((ctx) => {
        if (ctx.value.password && !estimatePasswordStrength(ctx.value.password).success) {
          ctx.issues.push({
            code: 'custom',
            fatal: true,
            input: ctx.value.password,
            message: t('common.insufficientPasswordStrength'),
            path: ['password']
          });
          return z.NEVER;
        }
        ctx.value.additionalPermissions?.forEach((permission, i) => {
          Object.entries(permission).forEach(([key, val]) => {
            if ((val satisfies string) === undefined) {
              ctx.issues.push({
                code: 'invalid_type',
                expected: 'string',
                input: val,
                path: ['additionalPermissions', i, key],
                received: 'undefined'
              });
            }
          });
        });
      }) satisfies z.ZodType<UpdateUserFormData>;
  }, [resolvedLanguage]);

  return (
    <Dialog open={isConfirmDeleteOpen} onOpenChange={setIsConfirmDeleteOpen}>
      <Form
        additionalButtons={{
          left: (
            <Dialog.Trigger asChild>
              <Button className="w-full" disabled={disableDelete} type="button" variant="danger">
                {t('core.delete')}
              </Button>
            </Dialog.Trigger>
          )
        }}
        content={[
          {
            fields: {
              password: {
                calculateStrength: (password) => {
                  return estimatePasswordStrength(password).score;
                },
                kind: 'string',
                label: t('common.password'),
                variant: 'password'
              }
            },
            title: t({
              en: 'Login Credentials',
              fr: 'Identifiants de connexion'
            })
          },
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
          },
          {
            fields: {
              groupIds: {
                kind: 'set',
                label: 'Group IDs',
                options: groupOptions,
                variant: 'listbox'
              }
            },
            title: t({
              en: 'Groups',
              fr: 'Groupes'
            })
          }
        ]}
        initialValues={initialValues}
        key={JSON.stringify(initialValues)}
        submitBtnLabel={t('core.save')}
        validationSchema={$UpdateUserFormData}
        onSubmit={({ additionalPermissions, ...data }) =>
          onSubmit({ additionalPermissions: additionalPermissions as undefined | UserPermission[], ...data })
        }
      />
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
              en: 'This action will permanently delete the account and cannot be undone.',
              fr: 'Cette action supprimera définitivement le compte et ne pourra pas être annulée.'
            })}
          </Dialog.Description>
        </Dialog.Header>
        <Dialog.Footer>
          <Button className="min-w-16" type="button" variant="danger" onClick={onDelete}>
            {t('core.yes')}
          </Button>
          <Button className="min-w-16" type="button" variant="outline" onClick={() => setIsConfirmDeleteOpen(false)}>
            {t('core.no')}
          </Button>
        </Dialog.Footer>
      </Dialog.Content>
    </Dialog>
  );
};

const RouteComponent = () => {
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
          className="grow"
          placeholder={t({
            en: 'Search by Username',
            fr: "Recherche par nom d'utilisateur"
          })}
          value={searchTerm}
          onValueChange={setSearchTerm}
        />
        <Button variant="outline">
          <Link to="/admin/users/create">
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
        <Sheet.Body className="grow overflow-y-scroll px-6 pb-6">
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

export const Route = createFileRoute('/_app/admin/users/')({
  component: RouteComponent,
  loader: async ({ context }) => {
    await context.queryClient.ensureQueryData(groupsQueryOptions());
    await context.queryClient.ensureQueryData(usersQueryOptions());
  }
});
