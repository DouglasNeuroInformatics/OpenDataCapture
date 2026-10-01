import { Button, Card, Select, Table } from '@douglasneuroinformatics/libui/components';
import { useTranslation } from '@douglasneuroinformatics/libui/hooks';
import { cn } from '@douglasneuroinformatics/libui/utils';
import {
  $AppAction,
  $AppSubjectName,
  isGrantablePermission,
  isGroupScopableSubject
} from '@opendatacapture/schemas/core';
import type { AppAction, AppSubjectName, Permissions } from '@opendatacapture/schemas/core';
import type { Group } from '@opendatacapture/schemas/group';
import type { User } from '@opendatacapture/schemas/user';
import { GlobeIcon, PlusIcon, Trash2Icon, TriangleAlertIcon } from 'lucide-react';

import { Chip } from '@/components/Chip';
import {
  ALL_GROUPS,
  grantableActions,
  grantableSubjects,
  isIncompleteDraft,
  withoutPermission
} from '@/utils/permissions';
import type { PermissionDraft } from '@/utils/permissions';

type CellSelectProps = {
  disabled?: boolean;
  label: string;
  name: string;
  onValueChange: (value: string) => void;
  options: { [key: string]: string };
  placeholder: string;
  value: string | undefined;
};

const CellSelect = ({ disabled, label, name, onValueChange, options, placeholder, value }: CellSelectProps) => (
  <Select disabled={disabled} name={name} value={value ?? ''} onValueChange={onValueChange}>
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
  drafts: PermissionDraft[];
  groups: Pick<Group, 'id' | 'name'>[];
  highlightIncomplete?: boolean;
  isSaving?: boolean;
  onDraftsChange: (drafts: PermissionDraft[]) => void;
  onPermissionsChange: (permissions: Permissions) => void;
  permissions: Permissions;
  user: User;
};

export const UserPermissionsEditor = ({
  drafts,
  groups,
  highlightIncomplete,
  isSaving,
  onDraftsChange,
  onPermissionsChange,
  permissions,
  user
}: UserPermissionsEditorProps) => {
  const { t } = useTranslation();

  const userGroups = groups.filter((group) => user.groupIds.includes(group.id));
  const defaultScope = userGroups.length === 1 ? userGroups[0]?.id : undefined;

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

  const isManageAll = drafts.some(({ action, subject }) => action === 'manage' && subject === 'all');
  const hasIneffectiveGrants = !permissions.every(isGrantablePermission);

  const updateDraft = (index: number, changes: PermissionDraft) => {
    onDraftsChange(drafts.map((draft, draftIndex) => (draftIndex === index ? { ...draft, ...changes } : draft)));
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
                <Table.Head className="w-24" />
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {permissions.map((permission, index) => (
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
                      disabled={isSaving}
                      size="icon"
                      type="button"
                      variant="ghost"
                      onClick={() => onPermissionsChange(withoutPermission(permissions, index))}
                    >
                      <Trash2Icon className="h-4 w-4" />
                    </Button>
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
            <Table.Footer className="bg-transparent font-normal">
              {drafts.map((draft, index) => {
                const { action, scope, subject } = draft;
                const isFlagged = highlightIncomplete && isIncompleteDraft(draft);
                return (
                  <Table.Row
                    aria-invalid={isFlagged || undefined}
                    className={cn(isFlagged && 'bg-destructive/10 hover:bg-destructive/10')}
                    data-testid="add-permission-row"
                    key={index}
                  >
                    <Table.Cell>
                      <CellSelect
                        disabled={isSaving}
                        label={columnLabels.action}
                        name="action"
                        options={Object.fromEntries(
                          grantableActions(subject).map((option) => [option, actionLabels[option]])
                        )}
                        placeholder={placeholder}
                        value={action}
                        onValueChange={(value) => updateDraft(index, { action: $AppAction.parse(value) })}
                      />
                    </Table.Cell>
                    <Table.Cell>
                      <CellSelect
                        disabled={isSaving}
                        label={columnLabels.subject}
                        name="subject"
                        options={Object.fromEntries(
                          grantableSubjects(action).map((option) => [option, subjectLabels[option]])
                        )}
                        placeholder={placeholder}
                        value={subject}
                        onValueChange={(value) => updateDraft(index, { subject: $AppSubjectName.parse(value) })}
                      />
                    </Table.Cell>
                    <Table.Cell>
                      {subject !== undefined && isGroupScopableSubject(subject) && (
                        <CellSelect
                          disabled={isSaving}
                          label={columnLabels.scope}
                          name="scope"
                          options={scopeOptions}
                          placeholder={placeholder}
                          value={scope}
                          onValueChange={(scope) => updateDraft(index, { scope })}
                        />
                      )}
                    </Table.Cell>
                    <Table.Cell className="py-1.5 text-right">
                      <Button
                        aria-label={t({ en: 'Remove permission', fr: "Retirer l'autorisation" })}
                        data-testid="permission-draft-remove"
                        disabled={isSaving}
                        size="icon"
                        type="button"
                        variant="ghost"
                        onClick={() => onDraftsChange(drafts.filter((_, draftIndex) => draftIndex !== index))}
                      >
                        <Trash2Icon className="h-4 w-4" />
                      </Button>
                      <Button
                        aria-label={t({ en: 'Add Permission', fr: 'Ajouter une autorisation' })}
                        className="text-muted-foreground hover:text-primary"
                        disabled={isSaving}
                        size="icon"
                        type="button"
                        variant="ghost"
                        onClick={() => onDraftsChange([...drafts, { scope: defaultScope }])}
                      >
                        <PlusIcon className="h-4 w-4" />
                      </Button>
                    </Table.Cell>
                  </Table.Row>
                );
              })}
              {drafts.length === 0 && (
                <Table.Row>
                  <Table.Cell className="text-right" colSpan={4}>
                    <Button
                      aria-label={t({ en: 'Add Permission', fr: 'Ajouter une autorisation' })}
                      disabled={isSaving}
                      type="button"
                      variant="ghost"
                      onClick={() => onDraftsChange([{ scope: defaultScope }])}
                    >
                      <PlusIcon className="h-4 w-4" />
                    </Button>
                  </Table.Cell>
                </Table.Row>
              )}
            </Table.Footer>
          </Table>
        </div>
        {highlightIncomplete && drafts.some(isIncompleteDraft) && (
          <p
            className="text-destructive mt-3 text-sm font-medium"
            data-testid="permission-drafts-incomplete"
            role="alert"
          >
            {t({
              en: 'Complete or remove the highlighted permission rows before saving.',
              fr: "Complétez ou retirez les lignes d'autorisation en surbrillance avant d'enregistrer."
            })}
          </p>
        )}
        {isManageAll && (
          <div
            className="mt-3 flex gap-2 rounded-lg border border-amber-500/40 bg-amber-500/10 p-3 text-sm text-amber-700 dark:text-amber-300"
            data-testid="manage-all-warning"
            role="alert"
          >
            <TriangleAlertIcon aria-hidden className="mt-0.5 h-4 w-4 shrink-0" />
            <p>
              {t({
                en: "Manage (All) makes this user an administrator: they can read and change every group's data, manage every user's account and permissions, and create instruments, which can run code on the server.",
                fr: 'Gérer (Tout) fait de cet utilisateur un administrateur, qui peut consulter et modifier les données de tous les groupes, gérer le compte et les autorisations de chaque utilisateur, et créer des instruments, lesquels peuvent exécuter du code sur le serveur.'
              })}
            </p>
          </div>
        )}
      </Card.Content>
    </Card>
  );
};
