import React, { useState } from 'react';

import { Badge, Button, Card, Label, Select, Table } from '@douglasneuroinformatics/libui/components';
import { useTranslation } from '@douglasneuroinformatics/libui/hooks';
import { $AppAction, $AppSubjectName, isGroupScopableSubject } from '@opendatacapture/schemas/core';
import type { AppAction, AppSubjectName, Permissions } from '@opendatacapture/schemas/core';
import type { Group } from '@opendatacapture/schemas/group';
import type { User } from '@opendatacapture/schemas/user';
import { PlusIcon, Trash2Icon } from 'lucide-react';

import { useUpdateUserPermissionsMutation } from '@/hooks/useUpdateUserPermissionsMutation';
import {
  $AddPermissionFormData,
  ALL_GROUPS,
  toUserPermission,
  withoutPermission,
  withPermission
} from '@/utils/permissions';

type SelectFieldProps = {
  label: string;
  name: string;
  onValueChange: (value: string) => void;
  options: { [key: string]: string };
  placeholder: string;
  value: string | undefined;
};

/** A labelled select laid out like libui's own form select, so the row reads as one of its forms. */
const SelectField = ({ label, name, onValueChange, options, placeholder, value }: SelectFieldProps) => {
  const triggerId = `${name}-select`;
  return (
    <div className="flex min-w-0 flex-col gap-3">
      <Label htmlFor={triggerId}>{label}</Label>
      <Select name={name} value={value ?? ''} onValueChange={onValueChange}>
        <Select.Trigger data-testid={`${name}-select-trigger`} id={triggerId}>
          <Select.Value placeholder={placeholder} />
        </Select.Trigger>
        <Select.Content data-testid={`${name}-select-content`}>
          {Object.entries(options).map(([key, optionLabel]) => (
            <Select.Item data-testid={`${name}-select-item-${key}`} key={key} value={key}>
              {optionLabel}
            </Select.Item>
          ))}
        </Select.Content>
      </Select>
    </div>
  );
};

type UserPermissionsEditorProps = {
  groups: Pick<Group, 'id' | 'name'>[];
  user: User;
};

export const UserPermissionsEditor = ({ groups, user }: UserPermissionsEditorProps) => {
  const { t } = useTranslation();
  const updatePermissionsMutation = useUpdateUserPermissionsMutation();

  const userGroups = groups.filter((group) => user.groupIds.includes(group.id));
  // With one group there is nothing to choose, so it is the scope unless the admin says otherwise.
  const defaultScope = userGroups.length === 1 ? userGroups[0]?.id : undefined;

  const [action, setAction] = useState<AppAction>();
  const [subject, setSubject] = useState<AppSubjectName>();
  const [scope, setScope] = useState<string | undefined>(defaultScope);

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
  const placeholder = t({ en: 'Choose…', fr: 'Choisir…' });

  const scopeOptions: { [id: string]: string } = {
    ...Object.fromEntries(userGroups.map((group) => [group.id, group.name])),
    [ALL_GROUPS]: allGroupsLabel
  };

  const isScopable = subject !== undefined && isGroupScopableSubject(subject);
  const draft = $AddPermissionFormData.safeParse({ action, scope, subject });

  const save = (permissions: Permissions, onSuccess?: () => void) => {
    updatePermissionsMutation.mutate({ id: user.id, permissions }, { onSuccess });
  };

  const handleAdd = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!draft.success) {
      return;
    }
    save(withPermission(user.additionalPermissions, toUserPermission(draft.data)), () => {
      setAction(undefined);
      setSubject(undefined);
      setScope(defaultScope);
    });
  };

  if (user.basePermissionLevel === 'ADMIN') {
    return (
      <Card data-testid="user-permissions-card">
        <Card.Header>
          <Card.Title>{t({ en: 'Permissions', fr: 'Autorisations' })}</Card.Title>
          <Card.Description data-testid="user-permissions-admin-notice">
            {t({
              en: 'Administrators hold every permission, so there is nothing further to grant.',
              fr: "Les administrateurs détiennent toutes les autorisations, il n'y a donc rien de plus à accorder."
            })}
          </Card.Description>
        </Card.Header>
      </Card>
    );
  }

  return (
    <Card data-testid="user-permissions-card">
      <Card.Header>
        <Card.Title>{t({ en: 'Permissions', fr: 'Autorisations' })}</Card.Title>
        <Card.Description data-testid="user-permissions-signin-note">
          {t({
            en: 'Grants added here come on top of the base permission level. Changes take effect the next time this user signs in.',
            fr: "Les autorisations accordées ici s'ajoutent au niveau de base. Les modifications prennent effet à la prochaine connexion de cet utilisateur."
          })}
        </Card.Description>
      </Card.Header>
      <Card.Content className="flex flex-col gap-6">
        {user.additionalPermissions.length === 0 ? (
          <div
            className="text-muted-foreground rounded-lg border border-dashed px-6 py-8 text-center text-sm"
            data-testid="user-permissions-empty"
          >
            {t({
              en: 'No additional permissions. Grant one below.',
              fr: 'Aucune autorisation supplémentaire. Accordez-en une ci-dessous.'
            })}
          </div>
        ) : (
          <div className="overflow-hidden rounded-lg border">
            <Table data-testid="user-permissions-table">
              <Table.Header>
                <Table.Row className="bg-muted/40 hover:bg-muted/40">
                  <Table.Head>{t({ en: 'Action', fr: 'Action' })}</Table.Head>
                  <Table.Head>{t({ en: 'Resource', fr: 'Ressource' })}</Table.Head>
                  <Table.Head>{t({ en: 'Scope', fr: 'Portée' })}</Table.Head>
                  <Table.Head className="w-16" />
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {user.additionalPermissions.map((permission, index) => (
                  <Table.Row
                    data-testid="user-permission-row"
                    key={`${index}-${permission.action}-${permission.subject}-${permission.groupId}`}
                  >
                    <Table.Cell className="font-medium">{actionLabels[permission.action]}</Table.Cell>
                    <Table.Cell>{subjectLabels[permission.subject]}</Table.Cell>
                    <Table.Cell data-testid="user-permission-scope">
                      {permission.groupId === null ? (
                        <Badge variant="secondary">{allGroupsLabel}</Badge>
                      ) : (
                        (groups.find((group) => group.id === permission.groupId)?.name ?? permission.groupId)
                      )}
                    </Table.Cell>
                    <Table.Cell className="py-1.5 text-right">
                      <Button
                        aria-label={t({ en: 'Remove permission', fr: "Retirer l'autorisation" })}
                        className="text-muted-foreground hover:text-destructive"
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
          </div>
        )}
        <form
          className="grid gap-4 sm:grid-cols-[1fr_1fr_1fr_auto] sm:items-end"
          data-testid="add-permission-form"
          onSubmit={handleAdd}
        >
          <SelectField
            label={t({ en: 'Action', fr: 'Action' })}
            name="action"
            options={actionLabels}
            placeholder={placeholder}
            value={action}
            onValueChange={(value) => setAction($AppAction.parse(value))}
          />
          <SelectField
            label={t({ en: 'Resource', fr: 'Ressource' })}
            name="subject"
            options={subjectLabels}
            placeholder={placeholder}
            value={subject}
            onValueChange={(value) => setSubject($AppSubjectName.parse(value))}
          />
          {isScopable ? (
            <SelectField
              label={t({ en: 'Scope', fr: 'Portée' })}
              name="scope"
              options={scopeOptions}
              placeholder={placeholder}
              value={scope}
              onValueChange={setScope}
            />
          ) : (
            <div className="hidden sm:block" />
          )}
          <Button
            className="gap-2"
            disabled={!draft.success || updatePermissionsMutation.isPending}
            type="submit"
            variant="primary"
          >
            <PlusIcon className="h-4 w-4" />
            {t({ en: 'Add permission', fr: 'Ajouter une autorisation' })}
          </Button>
        </form>
      </Card.Content>
    </Card>
  );
};
