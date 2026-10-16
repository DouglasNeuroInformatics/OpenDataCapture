import { useMemo, useState } from 'react';

import { snakeToCamelCase } from '@douglasneuroinformatics/libjs';
import { Button, Card, Dialog, Heading } from '@douglasneuroinformatics/libui/components';
import { useTranslation } from '@douglasneuroinformatics/libui/hooks';
import { ArchiveBoxArrowDownIcon, ArchiveBoxXMarkIcon, ChevronLeftIcon } from '@heroicons/react/24/solid';
import { isGrantablePermission } from '@opendatacapture/schemas/core';
import type { Permissions } from '@opendatacapture/schemas/core';
import { createFileRoute, Link } from '@tanstack/react-router';

import { Chip } from '@/components/Chip';
import { PageHeader } from '@/components/PageHeader';
import { UpdateUserForm } from '@/components/UpdateUserForm';
import type { UpdateUserFormInputData } from '@/components/UpdateUserForm';
import { UserIcon } from '@/components/UserIcon';
import { UserPermissionsEditor } from '@/components/UserPermissionsEditor';
import { useArchiveUserMutation } from '@/hooks/useArchiveUserMutation';
import { useFindUserQuery, useFindUserQueryOptions } from '@/hooks/useFindUserQuery';
import { groupsQueryOptions, useGroupsQuery } from '@/hooks/useGroupsQuery';
import { useUnarchiveUserMutation } from '@/hooks/useUnarchiveUserMutation';
import { useUpdateUserMutation } from '@/hooks/useUpdateUserMutation';
import { useAppStore } from '@/store';
import { isIncompleteDraft, withPermissionDrafts } from '@/utils/permissions';
import type { PermissionDraft } from '@/utils/permissions';
import { clearedIfBlank, omittedIfUnchanged, validationSummary } from '@/utils/validation';

const UserEditor = ({ userId }: { userId: string }) => {
  const currentUser = useAppStore((store) => store.currentUser);
  const { t } = useTranslation();
  const groupsQuery = useGroupsQuery();
  const userQuery = useFindUserQuery(userId);
  const archiveUserMutation = useArchiveUserMutation();
  const unarchiveUserMutation = useUnarchiveUserMutation();
  const updateUserMutation = useUpdateUserMutation();
  const [submitErrorMessage, setSubmitErrorMessage] = useState<null | string>(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [highlightIncompleteDrafts, setHighlightIncompleteDrafts] = useState(false);
  const [savedProfileCount, setSavedProfileCount] = useState(0);

  const groups = groupsQuery.data;
  const user = userQuery.data;

  const [localPermissions, setLocalPermissions] = useState<Permissions>(user.additionalPermissions);

  const [permissionDrafts, setPermissionDrafts] = useState<PermissionDraft[]>([
    { scope: user.groupIds.length === 1 ? user.groupIds[0] : undefined }
  ]);

  const isCurrentUser = user.username === currentUser?.username;
  const userGroups = groups.filter((group) => user.groupIds.includes(group.id));
  const roleLabel = user.basePermissionLevel
    ? t(`common.${snakeToCamelCase(user.basePermissionLevel)}`)
    : t({
        en: 'No base permission level',
        es: 'Sin nivel de permisos de base',
        fr: 'Aucun niveau de permission de base'
      });
  const identityLine = [`${user.firstName} ${user.lastName}`, roleLabel].join(' · ');

  const formData = useMemo<UpdateUserFormInputData>(
    () => ({
      groupOptions: Object.fromEntries(groups.map((group) => [group.id, group.name])),
      initialValues: {
        disabled: user.disabled ?? false,
        email: user.email ?? undefined,
        groupIds: new Set(user.groupIds),
        phoneNumber: user.phoneNumber ?? undefined
      },
      selectedUserBasePermission: user.basePermissionLevel
    }),
    [groups, user]
  );

  return (
    <div data-testid="admin-user-page">
      <PageHeader>
        <Heading className="text-center" variant="h2">
          {t({ en: 'Manage User', es: 'Gestionar el usuario', fr: "Gérer l'utilisateur" })}
        </Heading>
      </PageHeader>
      <div className="mx-auto flex max-w-3xl flex-col gap-6 pb-6">
        <div className="flex flex-col gap-3">
          <Link
            className="text-muted-foreground focus-visible:ring-ring flex items-center gap-0.5 self-start rounded-sm text-[11px] font-semibold tracking-widest uppercase transition-colors hover:text-blue-600 focus-visible:ring-1 focus-visible:outline-hidden dark:hover:text-blue-400"
            data-testid="admin-user-back"
            to="/admin/users"
          >
            <ChevronLeftIcon className="h-3.5 w-3.5" />
            {t({ en: 'Return', es: 'Volver', fr: 'Retour' })}
          </Link>
          <Card>
            <Card.Header className="gap-4 space-y-0">
              <div className="flex items-center gap-4">
                <UserIcon className="text-muted-foreground h-14 w-14 shrink-0" />
                <div className="min-w-0 flex-1">
                  <Card.Title className="text-lg" data-testid="admin-user-username">
                    {user.username}
                  </Card.Title>
                  <p className="text-muted-foreground mt-1 text-sm" data-testid="admin-user-identity">
                    {identityLine}
                  </p>
                  {userGroups.length > 0 && (
                    <div className="mt-2.5 flex flex-wrap gap-1.5">
                      {userGroups.map((group) => (
                        <Chip key={group.id}>{group.name}</Chip>
                      ))}
                    </div>
                  )}
                </div>
                {user.archivedAt ? (
                  <Button
                    className="shrink-0 gap-2"
                    disabled={isCurrentUser}
                    type="button"
                    variant="primary"
                    onClick={() => unarchiveUserMutation.mutate({ id: user.id })}
                  >
                    <ArchiveBoxXMarkIcon className="h-4 w-4" />
                    {t({ en: 'Unarchive', es: 'Desarchivar', fr: 'Désarchiver' })}
                  </Button>
                ) : (
                  <Dialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
                    <Dialog.Trigger asChild>
                      <Button className="shrink-0 gap-2" disabled={isCurrentUser} type="button" variant="danger">
                        <ArchiveBoxArrowDownIcon className="h-4 w-4" />
                        {t({ en: 'Archive', es: 'Archivar', fr: 'Archiver' })}
                      </Button>
                    </Dialog.Trigger>
                    <Dialog.Content>
                      <Dialog.Header>
                        <Dialog.Title>
                          {t({
                            en: 'Are you absolutely sure?',
                            es: '¿Está absolutamente seguro?',
                            fr: 'Êtes-vous absolument sûr ?'
                          })}
                        </Dialog.Title>
                        <Dialog.Description>
                          {t({
                            en: 'This will archive the account and prevent the user from signing in.',
                            es: 'Esto archivará la cuenta e impedirá que el usuario inicie sesión.',
                            fr: "Cela archivera le compte et empêchera l'utilisateur de se connecter."
                          })}
                        </Dialog.Description>
                      </Dialog.Header>
                      <Dialog.Footer>
                        <Button
                          className="min-w-16"
                          type="button"
                          variant="danger"
                          onClick={() => {
                            archiveUserMutation.mutate({ id: user.id }, { onSuccess: () => setIsConfirmOpen(false) });
                          }}
                        >
                          {t('core.yes')}
                        </Button>
                        <Button
                          className="min-w-16"
                          type="button"
                          variant="outline"
                          onClick={() => setIsConfirmOpen(false)}
                        >
                          {t('core.no')}
                        </Button>
                      </Dialog.Footer>
                    </Dialog.Content>
                  </Dialog>
                )}
              </div>
            </Card.Header>
          </Card>
        </div>
        <Card>
          <Card.Header>
            <Card.Title>{t({ en: 'Account', es: 'Cuenta', fr: 'Compte' })}</Card.Title>
            <Card.Description>
              {t({
                en: 'Contact details, group membership, status and password.',
                es: 'Información de contacto, pertenencia a grupos, estado y contraseña.',
                fr: 'Coordonnées, appartenance aux groupes, statut et mot de passe.'
              })}
            </Card.Description>
          </Card.Header>
          <Card.Content>
            {submitErrorMessage && (
              <div
                className="text-destructive mb-6 text-sm font-medium"
                data-testid="admin-user-edit-error"
                role="alert"
              >
                <p>
                  {t({
                    en: 'Your changes were not saved',
                    es: 'Sus cambios no se guardaron',
                    fr: "Vos modifications n'ont pas été enregistrées"
                  })}
                </p>
                <p>{submitErrorMessage}</p>
              </div>
            )}

            <UpdateUserForm
              data={formData}
              id="admin-user-account-form"
              key={savedProfileCount}
              onError={(error) => setSubmitErrorMessage(validationSummary(error))}
              onSubmit={async ({ confirmPassword: _, email, groupIds, phoneNumber, ...data }) => {
                if (isSaving) return undefined;
                if (permissionDrafts.some(isIncompleteDraft)) {
                  setHighlightIncompleteDrafts(true);
                  const errorMessage = t({
                    en: 'A permission row is incomplete. Choose its action, resource and scope, or remove it.',
                    es: 'Una fila de permisos está incompleta. Elija su acción, recurso y alcance, o elimínela.',
                    fr: "Une ligne d'autorisation est incomplète. Choisissez son action, sa ressource et sa portée, ou retirez-la."
                  });
                  setSubmitErrorMessage(errorMessage);
                  return { errorMessage, success: false };
                }
                setHighlightIncompleteDrafts(false);
                setIsSaving(true);
                setSubmitErrorMessage(null);
                const accountData = {
                  ...data,
                  email: clearedIfBlank(email),
                  groupIds: Array.from(groupIds),
                  phoneNumber: omittedIfUnchanged(phoneNumber, user.phoneNumber)
                };
                try {
                  const permissions = withPermissionDrafts(localPermissions, permissionDrafts)
                    .filter(isGrantablePermission)
                    .filter((permission) => permission.groupId === null || groupIds.has(permission.groupId));
                  await updateUserMutation.mutateAsync({
                    data: accountData,
                    id: user.id,
                    permissions: user.basePermissionLevel === 'ADMIN' ? undefined : permissions
                  });
                  await userQuery.refetch();
                  setLocalPermissions(permissions);
                  setPermissionDrafts([{ scope: groupIds.size === 1 ? Array.from(groupIds)[0] : undefined }]);
                  setSavedProfileCount((count) => count + 1);
                  return undefined;
                } catch {
                  const errorMessage = t({
                    en: 'Could not save all changes. Reload the page to check the saved account and permissions.',
                    es: 'No se pudieron guardar todos los cambios. Vuelva a cargar la página para comprobar la cuenta y los permisos guardados.',
                    fr: 'Impossible d’enregistrer toutes les modifications. Rechargez la page pour vérifier le compte et les autorisations enregistrés.'
                  });
                  setSubmitErrorMessage(errorMessage);
                  return { errorMessage, success: false };
                } finally {
                  setIsSaving(false);
                }
              }}
            />
          </Card.Content>
        </Card>
        <UserPermissionsEditor
          drafts={permissionDrafts}
          groups={groups}
          highlightIncomplete={highlightIncompleteDrafts}
          isSaving={isSaving}
          permissions={localPermissions}
          user={user}
          onDraftsChange={setPermissionDrafts}
          onPermissionsChange={setLocalPermissions}
        />
        <Button
          className="w-full"
          data-testid="save-user-changes"
          disabled={isSaving}
          form="admin-user-account-form"
          type="submit"
          variant="primary"
        >
          {t({ en: 'Save Changes', es: 'Guardar los cambios', fr: 'Enregistrer les modifications' })}
        </Button>
      </div>
    </div>
  );
};

const RouteComponent = () => {
  const { userId } = Route.useParams();
  return <UserEditor key={userId} userId={userId} />;
};

export const Route = createFileRoute('/_app/admin/users/$userId')({
  component: RouteComponent,
  loader: async ({ context, params }) => {
    await Promise.all([
      context.queryClient.ensureQueryData(groupsQueryOptions()),
      context.queryClient.ensureQueryData(useFindUserQueryOptions(params.userId))
    ]);
  }
});
