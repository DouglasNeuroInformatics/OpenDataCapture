import React, { useEffect, useMemo, useState } from 'react';

import { isAllUndefined, snakeToCamelCase } from '@douglasneuroinformatics/libjs';
import type { ZodErrorLike } from '@douglasneuroinformatics/libjs';
import { estimatePasswordStrength } from '@douglasneuroinformatics/libpasswd';
import { Button, DataTable, Dialog, Form, Heading, Sheet } from '@douglasneuroinformatics/libui/components';
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
import { usePasswordGenerator } from '@/hooks/usePasswordGenerator';
import type { PasswordFormValues } from '@/hooks/usePasswordGenerator';
import { useUpdateUserMutation } from '@/hooks/useUpdateUserMutation';
import { usersQueryOptions, useUsersQuery } from '@/hooks/useUsersQuery';
import { useAppStore } from '@/store';
import {
  $Email,
  $PhoneNumber,
  clearedIfBlank,
  omittedIfUnchanged,
  requiresGroup,
  validationSummary
} from '@/utils/validation';

type UpdateUserFormData = {
  additionalPermissions?: Partial<UserPermission>[];
  confirmPassword?: string | undefined;
  disabled?: boolean;
  email?: string | undefined;
  groupIds: Set<string>;
  password?: string | undefined;
  phoneNumber?: string | undefined;
};

/**
 * `mustResetPassword` is not a form field — it is derived at submission from whether the password
 * being saved is the generated one, so it is carried alongside the form data rather than in it.
 */
type UpdateUserSubmitData = UpdateUserFormData & {
  additionalPermissions?: UserPermission[];
  mustResetPassword?: boolean;
};

type UpdateUserFormInputData = {
  disableDelete: boolean;
  groupOptions: {
    [id: string]: string;
  };
  initialValues?: FormTypes.PartialNullableData<UpdateUserFormData>;
  selectedUserBasePermission?: User['basePermissionLevel'];
};

const UpdateUserForm: React.FC<{
  data: UpdateUserFormInputData;
  onDelete: () => void;
  onError: (error: ZodErrorLike) => void;
  onSubmit: (data: UpdateUserSubmitData) => Promisable<void>;
}> = ({ data, onDelete, onSubmit }) => {
  const { disableDelete, groupOptions, initialValues } = data;
  const { resolvedLanguage, t } = useTranslation();
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
  const { applyGeneratedPassword, generatedPassword, generatePassword, isGeneratedPassword } = usePasswordGenerator();

  const $UpdateUserFormData = useMemo(() => {
    return z
      .object({
        additionalPermissions: z.array($UserPermission.partial()).optional(),
        confirmPassword: z.string().min(1).optional(),
        disabled: z.boolean().optional(),
        email: $Email(t).optional(),
        groupIds: z.set(z.string()),
        password: z.string().min(1).optional(),
        phoneNumber: $PhoneNumber(t, initialValues?.phoneNumber).optional()
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
      })
      .check((ctx) => {
        const permissions = { basePermissionLevel: data.selectedUserBasePermission, disabled: ctx.value.disabled };
        if (requiresGroup(permissions) && ctx.value.groupIds.size <= 0) {
          ctx.issues.push({
            code: 'custom',
            input: ctx.value.groupIds,
            message: t('common.groupRequired'),
            path: ['groupIds']
          });
        }
      })
      .check((ctx) => {
        if (ctx.value.confirmPassword !== ctx.value.password) {
          ctx.issues.push({
            code: 'custom',
            input: ctx.value.confirmPassword,
            message: t('common.passwordsMustMatch'),
            path: ['confirmPassword']
          });
        }
      }) satisfies z.ZodType<UpdateUserFormData>;
    // `selectedUserBasePermission` decides whether a group is required, so a schema built for the
    // previously selected user must not be reused: two users differing only in permission level
    // would otherwise share one schema and be validated against the wrong rule.
  }, [data.selectedUserBasePermission, resolvedLanguage, initialValues?.phoneNumber]);

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
                generatePassword,
                kind: 'string',
                label: t('common.password'),
                variant: 'password'
              },
              // eslint-disable-next-line perfectionist/sort-objects
              confirmPassword: {
                kind: 'string',
                label: t('common.confirmPassword'),
                variant: 'password'
              }
            },
            title: t({
              en: 'Login Credentials',
              fr: 'Identifiants de connexion'
            })
          },
          {
            fields: {
              email: {
                kind: 'string',
                label: t('common.email'),
                variant: 'input'
              },
              phoneNumber: {
                kind: 'string',
                label: t('common.phoneNumber'),
                variant: 'input'
              }
            },
            title: t({
              en: 'Update Contact Information',
              fr: 'Mettre à jour les coordonnées'
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
                        fr: 'Supprimer'
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
                        fr: 'Modifier'
                      })
                    },
                    variant: 'select'
                  },
                  subject: {
                    kind: 'string',
                    label: t({
                      en: 'Resource',
                      fr: 'Ressource'
                    }),
                    options: {
                      all: t({
                        en: 'All',
                        fr: 'Tous'
                      }),
                      Assignment: t({
                        en: 'Assignment',
                        fr: 'Assignation'
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
                      InstrumentRepo: t({
                        en: 'Instrument Repository',
                        fr: "Dépôt d'instruments"
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
                  fr: 'Autorisation'
                })
              },
              disabled: {
                description: t({
                  en: 'Use this option if the user is not intended to log in, for example, when the account is used solely to identify the author of uploaded data.',
                  fr: 'Utilisez cette option si l’utilisateur n’a pas vocation à se connecter, par exemple lorsque le compte sert uniquement à identifier l’auteur de données téléversées.'
                }),
                kind: 'boolean',
                label: t({
                  en: 'Disabled',
                  fr: 'Désactivé'
                }),
                variant: 'radio'
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
        data-testid="update-user-form"
        initialValues={{
          ...initialValues,
          disabled: initialValues?.disabled ?? false
        }}
        key={JSON.stringify(initialValues)}
        submitBtnLabel={t('core.save')}
        subscribe={{
          // Annotated because libui's `FormProps` leaves `TData` uninstantiated in this one
          // position, so `setValues` is inferred as an error type rather than a setter.
          onChange: (_, setValues: React.Dispatch<React.SetStateAction<PasswordFormValues>>) =>
            applyGeneratedPassword(setValues),
          selector: () => generatedPassword
        }}
        validationSchema={$UpdateUserFormData}
        onError={onError}
        onSubmit={({ additionalPermissions, ...data }) =>
          onSubmit({
            additionalPermissions: additionalPermissions as undefined | UserPermission[],
            ...data,
            // Left undefined when the password field is blank, so saving other changes to a user who
            // still owes a reset does not quietly lift it.
            mustResetPassword: data.password ? isGeneratedPassword(data.password) : undefined
          })
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
  const [highlightedRowId, setHighlightedRowId] = useState<null | string>(null);
  const [submitErrorMessage, setSubmitErrorMessage] = useState<null | string>(null);

  const openManageSheet = (user: User) => {
    setSubmitErrorMessage(null);
    setSelectedUser(user);
  };

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
              additionalPermissions: selectedUser.additionalPermissions,
              email: selectedUser.email ?? undefined,
              groupIds: new Set(selectedUser.groupIds),
              phoneNumber: selectedUser.phoneNumber ?? undefined
            }
          : {
              email: selectedUser.email ?? undefined,
              groupIds: new Set(selectedUser.groupIds),
              phoneNumber: selectedUser.phoneNumber ?? undefined
            },
        selectedUserBasePermission: selectedUser.basePermissionLevel
      });
    }
  }, [groupsQuery.data, selectedUser]);

  return (
    <Sheet
      open={Boolean(selectedUser)}
      onOpenChange={() => {
        setSubmitErrorMessage(null);
        setSelectedUser(null);
      }}
    >
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
            onSelect: openManageSheet
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
        onRowDoubleClick={(user) => {
          setHighlightedRowId(user.id);
          openManageSheet(user);
        }}
      />
      <Sheet.Content className="flex flex-col p-0" data-testid="admin-user-edit-sheet">
        <Sheet.Header className="px-6 pt-6">
          <Sheet.Title>{selectedUser?.username}</Sheet.Title>
          <Sheet.Description>
            {t({
              en: 'Make changes to this user here. Click save when you are done.',
              fr: 'Apportez des modifications à cet utilisateur ici. Cliquez sur « Enregistrer » lorsque vous avez terminé.'
            })}
          </Sheet.Description>
          {/* In the header, which does not scroll: a rejected field can be several sections away
              from the submit button, and inline is then off-screen at the moment of the failure. */}
          {submitErrorMessage && (
            <div className="text-destructive text-sm font-medium" data-testid="admin-user-edit-error" role="alert">
              <p>
                {t({
                  en: 'Your changes were not saved',
                  fr: "Vos modifications n'ont pas été enregistrées"
                })}
              </p>
              <p>{submitErrorMessage}</p>
            </div>
          )}
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
              onError: (error) => setSubmitErrorMessage(validationSummary(error)),
              onSubmit: ({ confirmPassword: _, email, groupIds, phoneNumber, ...data }) => {
                setSubmitErrorMessage(null);
                updateUserMutation.mutate(
                  {
                    data: {
                      ...data,
                      email: clearedIfBlank(email),
                      groupIds: Array.from(groupIds),
                      phoneNumber: omittedIfUnchanged(phoneNumber, selectedUser!.phoneNumber)
                    },
                    id: selectedUser!.id
                  },
                  { onSuccess: () => setSelectedUser(null) }
                );
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
