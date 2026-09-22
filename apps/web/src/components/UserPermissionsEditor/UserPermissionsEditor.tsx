import { useState } from 'react';

import { Button, Card, Select, Table } from '@douglasneuroinformatics/libui/components';
import { useTranslation } from '@douglasneuroinformatics/libui/hooks';
import {
  $AppAction,
  $AppSubjectName,
  isGrantablePermission,
  isGroupScopableSubject
} from '@opendatacapture/schemas/core';
import type { AppAction, AppSubjectName, Permissions } from '@opendatacapture/schemas/core';
import type { Group } from '@opendatacapture/schemas/group';
import type { User } from '@opendatacapture/schemas/user';
import { GlobeIcon, PlusIcon, Trash2Icon } from 'lucide-react';

import { Chip } from '@/components/Chip';
import { useUpdateUserPermissionsMutation } from '@/hooks/useUpdateUserPermissionsMutation';
import {
  $AddPermissionFormData,
  ALL_GROUPS,
  grantableActions,
  grantableSubjects,
  toUserPermission,
  withoutPermission,
  withPermission
} from '@/utils/permissions';

type CellSelectProps = {
  label: string;
  name: string;
  onValueChange: (value: string) => void;
  options: { [key: string]: string };
  placeholder: string;
  value: string | undefined;
};

/**
 * A select sitting in a table cell, styled as the cell's text with a chevron rather than as a boxed
 * control, and named for assistive technology by the column it sits under. The trigger's own one-line
 * clamp clips a long label without an ellipsis, so its span is truncated instead.
 */
const CellSelect = ({ label, name, onValueChange, options, placeholder, value }: CellSelectProps) => (
  <Select name={name} value={value ?? ''} onValueChange={onValueChange}>
    <Select.Trigger
      aria-label={label}
      className="data-[placeholder]:text-muted-foreground h-auto min-w-0 border-0 bg-transparent px-0 py-0 shadow-none [&>span]:block [&>span]:min-w-0 [&>span]:truncate"
      data-testid={`${name}-select-trigger`}
    >
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
);

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

  const columnLabels = {
    action: t({ en: 'Action', fr: 'Action' }),
    scope: t({ en: 'Scope', fr: 'Portée' }),
    subject: t({ en: 'Resource', fr: 'Ressource' })
  };

  const allGroupsLabel = t({ en: 'All Groups', fr: 'Tous les groupes' });
  const placeholder = t({ en: 'Choose…', fr: 'Choisir…' });

  const scopeOptions: { [id: string]: string } = {
    ...Object.fromEntries(userGroups.map((group) => [group.id, group.name])),
    [ALL_GROUPS]: allGroupsLabel
  };

  const actionOptions = Object.fromEntries(grantableActions(subject).map((option) => [option, actionLabels[option]]));
  const subjectOptions = Object.fromEntries(grantableSubjects(action).map((option) => [option, subjectLabels[option]]));

  const isScopable = subject !== undefined && isGroupScopableSubject(subject);
  const draft = $AddPermissionFormData.safeParse({ action, scope, subject });
  const hasIneffectiveGrants = !user.additionalPermissions.every(isGrantablePermission);

  // A grant stored before it stopped being grantable is refused by the route, so it is left out of
  // every save; the note above the table says so.
  const save = (permissions: Permissions, onSuccess?: () => void) => {
    updatePermissionsMutation.mutate(
      { id: user.id, permissions: permissions.filter(isGrantablePermission) },
      { onSuccess }
    );
  };

  const handleAdd = () => {
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
      <Card.Content>
        {hasIneffectiveGrants && (
          <p className="text-muted-foreground mb-3 text-sm" data-testid="user-permissions-ineffective-note">
            {t({
              en: 'Only an administrator can create, modify or delete users, so grants marked "No effect" do nothing. They are removed the next time this user\'s permissions are changed.',
              fr: 'Seul un administrateur peut créer, modifier ou supprimer des utilisateurs : les autorisations marquées « Sans effet » ne font donc rien. Elles sont retirées à la prochaine modification des autorisations de cet utilisateur.'
            })}
          </p>
        )}
        <div className="overflow-hidden rounded-lg border">
          <Table className="table-fixed" data-testid="user-permissions-table">
            <Table.Header>
              <Table.Row className="bg-background/60 hover:bg-background/60">
                <Table.Head className="w-[25%]">{columnLabels.action}</Table.Head>
                <Table.Head className="w-[33%]">{columnLabels.subject}</Table.Head>
                <Table.Head className="w-[30%]">{columnLabels.scope}</Table.Head>
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
                  <Table.Cell>
                    <div className="flex flex-wrap items-center gap-1.5">
                      {subjectLabels[permission.subject]}
                      {!isGrantablePermission(permission) && (
                        <Chip data-testid="user-permission-ineffective" variant="warning">
                          {t({ en: 'No effect', fr: 'Sans effet' })}
                        </Chip>
                      )}
                    </div>
                  </Table.Cell>
                  <Table.Cell data-testid="user-permission-scope">
                    {permission.groupId === null ? (
                      <span className="inline-flex items-center gap-1.5 text-amber-700 dark:text-amber-300">
                        <GlobeIcon aria-hidden className="h-3.5 w-3.5" />
                        {allGroupsLabel}
                      </span>
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
            {/* The add controls are the table's last row, under the headers that name them. */}
            <Table.Footer className="bg-transparent font-normal">
              <Table.Row data-testid="add-permission-row">
                <Table.Cell>
                  <CellSelect
                    label={columnLabels.action}
                    name="action"
                    options={actionOptions}
                    placeholder={placeholder}
                    value={action}
                    onValueChange={(value) => setAction($AppAction.parse(value))}
                  />
                </Table.Cell>
                <Table.Cell>
                  <CellSelect
                    label={columnLabels.subject}
                    name="subject"
                    options={subjectOptions}
                    placeholder={placeholder}
                    value={subject}
                    onValueChange={(value) => setSubject($AppSubjectName.parse(value))}
                  />
                </Table.Cell>
                <Table.Cell>
                  {isScopable && (
                    <CellSelect
                      label={columnLabels.scope}
                      name="scope"
                      options={scopeOptions}
                      placeholder={placeholder}
                      value={scope}
                      onValueChange={setScope}
                    />
                  )}
                </Table.Cell>
                <Table.Cell className="py-1.5 text-right">
                  <Button
                    aria-label={t({ en: 'Add Permission', fr: 'Ajouter une autorisation' })}
                    className="text-muted-foreground hover:text-primary"
                    disabled={!draft.success || updatePermissionsMutation.isPending}
                    size="icon"
                    type="button"
                    variant="ghost"
                    onClick={handleAdd}
                  >
                    <PlusIcon className="h-4 w-4" />
                  </Button>
                </Table.Cell>
              </Table.Row>
            </Table.Footer>
          </Table>
        </div>
      </Card.Content>
    </Card>
  );
};
