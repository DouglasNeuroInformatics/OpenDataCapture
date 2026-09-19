import React from 'react';

import { Badge, Button, Form, Table } from '@douglasneuroinformatics/libui/components';
import { useTranslation } from '@douglasneuroinformatics/libui/hooks';
import { isGroupScopableSubject } from '@opendatacapture/schemas/core';
import type { AppAction, AppSubjectName, Permissions } from '@opendatacapture/schemas/core';
import type { Group } from '@opendatacapture/schemas/group';
import type { User } from '@opendatacapture/schemas/user';
import { Trash2Icon } from 'lucide-react';

import { useUpdateUserPermissionsMutation } from '@/hooks/useUpdateUserPermissionsMutation';
import {
  $AddPermissionFormData,
  ALL_GROUPS,
  toUserPermission,
  withoutPermission,
  withPermission
} from '@/utils/permissions';
import type { AddPermissionFormData } from '@/utils/permissions';

type UserPermissionsEditorProps = {
  groups: Pick<Group, 'id' | 'name'>[];
  user: User;
};

export const UserPermissionsEditor = ({ groups, user }: UserPermissionsEditorProps) => {
  const { t } = useTranslation();
  const updatePermissionsMutation = useUpdateUserPermissionsMutation();

  const actionLabels: { [K in AppAction]: string } = {
    create: t({ en: 'Create', fr: 'Créer' }),
    delete: t({ en: 'Delete', fr: 'Supprimer' }),
    manage: t({ en: 'Manage (All)', fr: 'Gérer (Tout)' }),
    read: t({ en: 'Read', fr: 'Lire' }),
    update: t({ en: 'Update', fr: 'Modifier' })
  };

  const subjectLabels: { [K in AppSubjectName]: string } = {
    all: t({ en: 'All', fr: 'Tous' }),
    Assignment: t({ en: 'Assignment', fr: 'Assignation' }),
    Group: t({ en: 'Group', fr: 'Groupe' }),
    Instrument: t({ en: 'Instrument', fr: 'Instrument' }),
    InstrumentRecord: t({ en: 'Instrument Record', fr: "Enregistrement de l'instrument" }),
    InstrumentRepo: t({ en: 'Instrument Repository', fr: "Dépôt d'instruments" }),
    Session: t({ en: 'Session', fr: 'Session' }),
    Subject: t({ en: 'Subject', fr: 'Client' }),
    User: t({ en: 'User', fr: 'Utilisateur' })
  };

  const allGroupsLabel = t({ en: 'All groups', fr: 'Tous les groupes' });

  const userGroups = groups.filter((group) => user.groupIds.includes(group.id));

  const scopeOptions: { [id: string]: string } = {
    ...Object.fromEntries(userGroups.map((group) => [group.id, group.name])),
    [ALL_GROUPS]: allGroupsLabel
  };

  const save = (permissions: Permissions) => {
    updatePermissionsMutation.mutate({ id: user.id, permissions });
  };

  if (user.basePermissionLevel === 'ADMIN') {
    return (
      <p className="text-muted-foreground text-sm" data-testid="user-permissions-admin-notice">
        {t({
          en: 'Administrators hold every permission, so there is nothing further to grant.',
          fr: "Les administrateurs détiennent toutes les autorisations, il n'y a donc rien de plus à accorder."
        })}
      </p>
    );
  }

  return (
    <div className="space-y-6">
      <p className="text-muted-foreground text-sm" data-testid="user-permissions-signin-note">
        {t({
          en: 'Changes take effect the next time this user signs in.',
          fr: 'Les modifications prennent effet à la prochaine connexion de cet utilisateur.'
        })}
      </p>
      <Table data-testid="user-permissions-table">
        <Table.Header>
          <Table.Row>
            <Table.Head>{t({ en: 'Action', fr: 'Action' })}</Table.Head>
            <Table.Head>{t({ en: 'Resource', fr: 'Ressource' })}</Table.Head>
            <Table.Head>{t({ en: 'Scope', fr: 'Portée' })}</Table.Head>
            <Table.Head />
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {user.additionalPermissions.length === 0 && (
            <Table.Row data-testid="user-permissions-empty">
              <Table.Cell className="text-muted-foreground" colSpan={4}>
                {t({ en: 'No additional permissions', fr: 'Aucune autorisation supplémentaire' })}
              </Table.Cell>
            </Table.Row>
          )}
          {user.additionalPermissions.map((permission, index) => (
            <Table.Row
              data-testid="user-permission-row"
              key={`${index}-${permission.action}-${permission.subject}-${permission.groupId}`}
            >
              <Table.Cell>{actionLabels[permission.action]}</Table.Cell>
              <Table.Cell>{subjectLabels[permission.subject]}</Table.Cell>
              <Table.Cell data-testid="user-permission-scope">
                {permission.groupId === null ? (
                  <Badge variant="secondary">{allGroupsLabel}</Badge>
                ) : (
                  (groups.find((group) => group.id === permission.groupId)?.name ?? permission.groupId)
                )}
              </Table.Cell>
              <Table.Cell className="text-right">
                <Button
                  aria-label={t({ en: 'Remove permission', fr: "Retirer l'autorisation" })}
                  data-testid="user-permission-remove"
                  disabled={updatePermissionsMutation.isPending}
                  size="icon"
                  type="button"
                  variant="ghost"
                  onClick={() => save(withoutPermission(user.additionalPermissions, index))}
                >
                  <Trash2Icon className="h-4 w-4" />
                </Button>
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table>
      <Form
        content={{
          action: {
            kind: 'string',
            label: t({ en: 'Action', fr: 'Action' }),
            options: actionLabels,
            variant: 'select'
          },
          subject: {
            kind: 'string',
            label: t({ en: 'Resource', fr: 'Ressource' }),
            options: subjectLabels,
            variant: 'select'
          },
          // Declared last so the scope follows the resource it depends on, which is also render order.
          // eslint-disable-next-line perfectionist/sort-objects
          scope: {
            deps: ['subject'],
            kind: 'dynamic',
            render: ({ subject }) => {
              if (subject === undefined || !isGroupScopableSubject(subject)) {
                return null;
              }
              return {
                kind: 'string',
                label: t({ en: 'Scope', fr: 'Portée' }),
                options: scopeOptions,
                variant: 'select'
              };
            }
          }
        }}
        data-testid="add-permission-form"
        submitBtnLabel={t({ en: 'Add Permission', fr: 'Ajouter une autorisation' })}
        subscribe={{
          // A hidden dynamic field is cleared by libui, so `initialValues` cannot preselect the
          // scope; it is set here once a resource that takes one is chosen. Annotated because
          // `FormProps` leaves `TData` uninstantiated in this position.
          onChange: (values, setValues: React.Dispatch<React.SetStateAction<Partial<AddPermissionFormData>>>) => {
            const [onlyGroup] = userGroups;
            if (!onlyGroup || userGroups.length !== 1 || values.scope !== undefined) {
              return;
            }
            if (values.subject === undefined || !isGroupScopableSubject(values.subject)) {
              return;
            }
            setValues((previous) => ({ ...previous, scope: onlyGroup.id }));
          },
          selector: (values) => values.subject
        }}
        validationSchema={$AddPermissionFormData}
        onSubmit={(data) => save(withPermission(user.additionalPermissions, toUserPermission(data)))}
      />
    </div>
  );
};
