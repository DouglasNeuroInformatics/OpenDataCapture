import { useMemo, useState } from 'react';

import { Button, Heading } from '@douglasneuroinformatics/libui/components';
import { useTranslation } from '@douglasneuroinformatics/libui/hooks';
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';

import { PageHeader } from '@/components/PageHeader';
import { UpdateUserForm } from '@/components/UpdateUserForm';
import type { UpdateUserFormInputData } from '@/components/UpdateUserForm';
import { UserPermissionsEditor } from '@/components/UserPermissionsEditor';
import { useDeleteUserMutation } from '@/hooks/useDeleteUserMutation';
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
  const deleteUserMutation = useDeleteUserMutation();
  const updateUserMutation = useUpdateUserMutation();
  const [submitErrorMessage, setSubmitErrorMessage] = useState<null | string>(null);
  // libui's `Form` clears its values after a successful submit, so the profile form is remounted
  // from the saved user once a save lands. Keyed on this rather than on the query's refetch time so
  // that saving a permission below does not discard edits typed here but not yet saved.
  const [savedProfileCount, setSavedProfileCount] = useState(0);

  const groups = groupsQuery.data;
  const user = userQuery.data;

  const formData = useMemo<UpdateUserFormInputData>(
    () => ({
      disableDelete: user.username === currentUser?.username,
      groupOptions: Object.fromEntries(groups.map((group) => [group.id, group.name])),
      initialValues: {
        disabled: user.disabled ?? false,
        email: user.email ?? undefined,
        groupIds: new Set(user.groupIds),
        phoneNumber: user.phoneNumber ?? undefined
      },
      selectedUserBasePermission: user.basePermissionLevel
    }),
    [currentUser?.username, groups, user]
  );

  return (
    <div data-testid="admin-user-page">
      <PageHeader>
        <Heading className="text-center" variant="h2">
          {user.username}
        </Heading>
      </PageHeader>
      <div className="mx-auto max-w-3xl space-y-10">
        <Button variant="outline">
          <Link to="/admin/users">{t({ en: 'Back to Users', fr: 'Retour aux utilisateurs' })}</Link>
        </Button>
        <section className="space-y-4">
          <Heading variant="h4">{t({ en: 'Profile', fr: 'Profil' })}</Heading>
          {/* Above the form rather than beside the field: a rejected field can be several sections
              away from the submit button, and is then off-screen at the moment of the failure. */}
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
          <UpdateUserForm
            data={formData}
            key={savedProfileCount}
            onDelete={() => {
              deleteUserMutation.mutate(
                { id: user.id },
                {
                  onSuccess: () => {
                    void navigate({ to: '/admin/users' });
                  }
                }
              );
            }}
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
        </section>
        <section className="space-y-4">
          <Heading variant="h4">{t({ en: 'Additional Permissions', fr: 'Autorisations supplémentaires' })}</Heading>
          <UserPermissionsEditor groups={groups} user={user} />
        </section>
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
