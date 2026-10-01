import { useMemo, useState } from 'react';

import { snakeToCamelCase } from '@douglasneuroinformatics/libjs';
import { Button, Card, Dialog, Heading } from '@douglasneuroinformatics/libui/components';
import { useTranslation } from '@douglasneuroinformatics/libui/hooks';
import { ChevronLeftIcon } from '@heroicons/react/24/solid';
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';

import { Chip } from '@/components/Chip';
import { PageHeader } from '@/components/PageHeader';
import { UpdateUserForm } from '@/components/UpdateUserForm';
import type { UpdateUserFormInputData } from '@/components/UpdateUserForm';
import { UserIcon } from '@/components/UserIcon';
import { UserPermissionsEditor } from '@/components/UserPermissionsEditor';
import { useArchiveUserMutation } from '@/hooks/useArchiveUserMutation';
import { useFindUserQuery, useFindUserQueryOptions } from '@/hooks/useFindUserQuery';
import { groupsQueryOptions, useGroupsQuery } from '@/hooks/useGroupsQuery';
import { useUpdateUserMutation } from '@/hooks/useUpdateUserMutation';
import { useAppStore } from '@/store';
import { clearedIfBlank, omittedIfUnchanged, validationSummary } from '@/utils/validation';

const RouteComponent = () => {
  const { userId } = Route.useParams();
  const currentUser = useAppStore((store) => store.currentUser);
  const { t } = useTranslation();
  const navigate = useNavigate();
  const groupsQuery = useGroupsQuery();
  const userQuery = useFindUserQuery(userId);
  const archiveUserMutation = useArchiveUserMutation();
  const updateUserMutation = useUpdateUserMutation();
  const [submitErrorMessage, setSubmitErrorMessage] = useState<null | string>(null);
  const [isConfirmArchiveOpen, setIsConfirmArchiveOpen] = useState(false);
  // libui's `Form` clears its values after a successful submit, so the profile form is remounted
  // from the saved user once a save lands. Keyed on this rather than on the query's refetch time so
  // that saving a permission below does not discard edits typed here but not yet saved.
  const [savedProfileCount, setSavedProfileCount] = useState(0);

  const groups = groupsQuery.data;
  const user = userQuery.data;

  const isCurrentUser = user.username === currentUser?.username;
  const userGroups = groups.filter((group) => user.groupIds.includes(group.id));
  const roleLabel = user.basePermissionLevel
    ? t(`common.${snakeToCamelCase(user.basePermissionLevel)}`)
    : t({ en: 'No base permission level', fr: 'Aucun niveau de permission de base' });
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
          {t({ en: 'Manage User', fr: "Gérer l'utilisateur" })}
        </Heading>
      </PageHeader>
      <div className="mx-auto flex max-w-3xl flex-col gap-6 pb-6">
        <Card>
          <Card.Header className="gap-4 space-y-0">
            <Link
              className="text-muted-foreground focus-visible:ring-ring focus-visible:outline-hidden flex items-center gap-0.5 self-start rounded-sm text-[11px] font-semibold uppercase tracking-widest transition-colors hover:text-blue-600 focus-visible:ring-1 dark:hover:text-blue-400"
              data-testid="admin-user-back"
              to="/admin/users"
            >
              <ChevronLeftIcon className="h-3.5 w-3.5" />
              {t({ en: 'Return', fr: 'Retour' })}
            </Link>
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
            </div>
          </Card.Header>
        </Card>
        <Card>
          <Card.Header>
            <Card.Title>{t({ en: 'Account', fr: 'Compte' })}</Card.Title>
            <Card.Description>
              {t({
                en: 'Contact details, group membership, status and password.',
                fr: 'Coordonnées, appartenance aux groupes, statut et mot de passe.'
              })}
            </Card.Description>
          </Card.Header>
          <Card.Content>
            {/* Above the form rather than beside the field: a rejected field can be several sections
                away from the save button, and is then off-screen at the moment of the failure. */}
            {submitErrorMessage && (
              <div
                className="text-destructive mb-6 text-sm font-medium"
                data-testid="admin-user-edit-error"
                role="alert"
              >
                <p>
                  {t({
                    en: 'Your changes were not saved',
                    fr: "Vos modifications n'ont pas été enregistrées"
                  })}
                </p>
                <p>{submitErrorMessage}</p>
              </div>
            )}
            <UpdateUserForm
              data={formData}
              key={savedProfileCount}
              onError={(error) => setSubmitErrorMessage(validationSummary(error))}
              onSubmit={({ confirmPassword: _, email, groupIds, phoneNumber, ...data }) => {
                setSubmitErrorMessage(null);
                updateUserMutation.mutate(
                  {
                    data: {
                      ...data,
                      email: clearedIfBlank(email),
                      groupIds: Array.from(groupIds),
                      phoneNumber: omittedIfUnchanged(phoneNumber, user.phoneNumber)
                    },
                    id: user.id
                  },
                  { onSuccess: () => setSavedProfileCount((count) => count + 1) }
                );
              }}
            />
          </Card.Content>
        </Card>
        <UserPermissionsEditor groups={groups} user={user} />
        <Card>
          <Card.Header>
            <Card.Title>{t({ en: 'Archive User', es: 'Archivar usuario', fr: "Archiver l'utilisateur" })}</Card.Title>
            <Card.Description>
              {isCurrentUser
                ? t({
                    en: 'You cannot archive the account you are signed in with.',
                    es: 'No puede archivar la cuenta con la que ha iniciado sesión.',
                    fr: 'Vous ne pouvez pas archiver le compte avec lequel vous êtes connecté.'
                  })
                : t({
                    en: 'Disables this account. The user will no longer be able to sign in.',
                    es: 'Desactiva esta cuenta. El usuario ya no podrá iniciar sesión.',
                    fr: "Désactive ce compte. L'utilisateur ne pourra plus se connecter."
                  })}
            </Card.Description>
          </Card.Header>
          <Card.Footer>
            <Dialog open={isConfirmArchiveOpen} onOpenChange={setIsConfirmArchiveOpen}>
              <Dialog.Trigger asChild>
                <Button disabled={isCurrentUser} type="button" variant="danger">
                  {t({ en: 'Archive User', es: 'Archivar usuario', fr: "Archiver l'utilisateur" })}
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
                      archiveUserMutation.mutate(
                        { id: user.id },
                        {
                          onSuccess: () => {
                            void navigate({ to: '/admin/users' });
                          }
                        }
                      );
                    }}
                  >
                    {t('core.yes')}
                  </Button>
                  <Button
                    className="min-w-16"
                    type="button"
                    variant="outline"
                    onClick={() => setIsConfirmArchiveOpen(false)}
                  >
                    {t('core.no')}
                  </Button>
                </Dialog.Footer>
              </Dialog.Content>
            </Dialog>
          </Card.Footer>
        </Card>
      </div>
    </div>
  );
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
