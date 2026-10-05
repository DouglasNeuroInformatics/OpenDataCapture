import type { ComponentProps, PropsWithChildren } from 'react';

import type { ZodErrorLike } from '@douglasneuroinformatics/libjs';
import type { Group } from '@opendatacapture/schemas/group';
import type { User } from '@opendatacapture/schemas/user';
import { QueryClient } from '@tanstack/react-query';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type { UpdateUserForm, UpdateUserSubmitData } from '@/components/UpdateUserForm';
import type { UserPermissionsEditor } from '@/components/UserPermissionsEditor';
import { Route } from '@/routes/_app/admin/users/$userId';

import '@/services/i18n';

type UpdateUserFormProps = ComponentProps<typeof UpdateUserForm>;
type UserPermissionsEditorProps = ComponentProps<typeof UserPermissionsEditor>;
type MutateOptions = { onSuccess: () => void };

const mocks = vi.hoisted(() => {
  const makeUser = (): User => ({
    additionalPermissions: [],
    basePermissionLevel: 'STANDARD',
    createdAt: new Date('2026-01-01'),
    firstName: 'Jane',
    groupIds: ['group-1'],
    id: 'user-1',
    lastName: 'Doe',
    updatedAt: new Date('2026-01-01'),
    username: 'jane.doe'
  });
  const state: {
    currentUser: null | { username: string };
    groups: Pick<Group, 'id' | 'name'>[];
    user: User;
  } = { currentUser: null, groups: [], user: makeUser() };
  const refetch = vi.fn<() => Promise<void>>();
  return {
    archiveMutate: vi.fn<(variables: { id: string }, options: MutateOptions) => void>(),
    formMounted: vi.fn(),
    groupsQueryOptions: vi.fn(() => ({ queryKey: ['groups'] })),
    makeUser,
    mutateAsync: vi.fn<(variables: unknown) => Promise<void>>(),
    PermissionsEditor: vi.fn((_: UserPermissionsEditorProps) => <div data-testid="user-permissions-editor" />),
    refetch,
    state,
    unarchiveMutate: vi.fn<(variables: { id: string }) => void>(),
    UpdateForm: vi.fn((_: UpdateUserFormProps) => null),
    useFindUserQuery: vi.fn((_: string) => ({ data: state.user, refetch })),
    useFindUserQueryOptions: vi.fn((id: string) => ({ queryKey: ['users', id] }))
  };
});

vi.mock('@tanstack/react-router', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@tanstack/react-router')>()),
  Link: ({ children, to, ...props }: PropsWithChildren<{ 'data-testid': string; to: string }>) => (
    <a data-testid={props['data-testid']} href={to}>
      {children}
    </a>
  )
}));
vi.mock('@/components/UpdateUserForm', async () => {
  const { useEffect } = await import('react');
  return {
    UpdateUserForm: (props: UpdateUserFormProps) => {
      useEffect(() => mocks.formMounted(), []);
      mocks.UpdateForm(props);
      return <div data-testid="update-user-form" />;
    }
  };
});
vi.mock('@/components/UserPermissionsEditor', () => ({ UserPermissionsEditor: mocks.PermissionsEditor }));
vi.mock('@/hooks/useArchiveUserMutation', () => ({
  useArchiveUserMutation: () => ({ mutate: mocks.archiveMutate })
}));
vi.mock('@/hooks/useFindUserQuery', () => ({
  useFindUserQuery: mocks.useFindUserQuery,
  useFindUserQueryOptions: mocks.useFindUserQueryOptions
}));
vi.mock('@/hooks/useGroupsQuery', () => ({
  groupsQueryOptions: mocks.groupsQueryOptions,
  useGroupsQuery: () => ({ data: mocks.state.groups })
}));
vi.mock('@/hooks/useUnarchiveUserMutation', () => ({
  useUnarchiveUserMutation: () => ({ mutate: mocks.unarchiveMutate })
}));
vi.mock('@/hooks/useUpdateUserMutation', () => ({
  useUpdateUserMutation: () => ({ mutateAsync: mocks.mutateAsync })
}));
vi.mock('@/store', () => ({
  useAppStore: <TSelected,>(selector: (store: { currentUser: typeof mocks.state.currentUser }) => TSelected) =>
    selector({ currentUser: mocks.state.currentUser })
}));

const GROUP_ONE = { id: 'group-1', name: 'Group One' };
const GROUP_TWO = { id: 'group-2', name: 'Group Two' };

const submitData = (overrides: Partial<UpdateUserSubmitData> = {}): UpdateUserSubmitData => ({
  confirmPassword: undefined,
  disabled: false,
  email: undefined,
  groupIds: new Set(['group-1']),
  password: undefined,
  phoneNumber: undefined,
  ...overrides
});

const validationError = (...messages: string[]): ZodErrorLike => ({
  issues: messages.map((message) => ({ code: 'custom', message, path: [] })),
  name: 'ZodError'
});

const runLoader = (queryClient: QueryClient) => {
  const { loader } = Route.options;
  if (typeof loader !== 'function') {
    throw new Error('Expected the route to define its loader as a function');
  }
  return loader({ context: { queryClient }, params: { userId: 'user-1' } } as Parameters<typeof loader>[0]);
};

const renderPage = () => {
  const Component = Route.options.component!;
  return render(<Component />);
};

const formProps = () => mocks.UpdateForm.mock.lastCall![0];

const editorProps = () => mocks.PermissionsEditor.mock.lastCall![0];

const submit = async (data: UpdateUserSubmitData = submitData()) => {
  let result: unknown;
  await act(async () => {
    result = await formProps().onSubmit(data);
  });
  return result;
};

const errorAlert = () => screen.queryByTestId('admin-user-edit-error');

const saveButton = () => screen.getByTestId<HTMLButtonElement>('save-user-changes');

beforeEach(() => {
  vi.clearAllMocks();
  vi.spyOn(Route, 'useParams').mockReturnValue({ userId: 'user-1' });
  mocks.mutateAsync.mockResolvedValue(undefined);
  mocks.refetch.mockResolvedValue(undefined);
  mocks.state.currentUser = { username: 'admin' };
  mocks.state.groups = [GROUP_ONE, GROUP_TWO];
  mocks.state.user = mocks.makeUser();
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe('admin user route', () => {
  it('should prefetch the groups and the user in the loader, so the editor renders without a waterfall', async () => {
    const queryClient = new QueryClient();
    const ensureQueryData = vi.spyOn(queryClient, 'ensureQueryData').mockResolvedValue(undefined);
    await runLoader(queryClient);
    expect(ensureQueryData).toHaveBeenCalledWith({ queryKey: ['groups'] });
    expect(ensureQueryData).toHaveBeenCalledWith({ queryKey: ['users', 'user-1'] });
  });

  it('should load the user named in the url', () => {
    renderPage();
    expect(mocks.useFindUserQuery).toHaveBeenCalledWith('user-1');
  });

  describe('identity card', () => {
    it('should show the username and the full name with the base permission level', () => {
      renderPage();
      expect(screen.getByTestId('admin-user-username').textContent).toBe('jane.doe');
      expect(screen.getByTestId('admin-user-identity').textContent).toBe('Jane Doe · Standard');
    });

    it('should say so when the user has no base permission level', () => {
      mocks.state.user.basePermissionLevel = null;
      renderPage();
      expect(screen.getByTestId('admin-user-identity').textContent).toBe('Jane Doe · No base permission level');
    });

    it('should list only the groups the user belongs to', () => {
      renderPage();
      expect(screen.getByText('Group One')).toBeTruthy();
      expect(screen.queryByText('Group Two')).toBeNull();
    });

    it('should list no groups for a user who belongs to none', () => {
      mocks.state.user.groupIds = [];
      renderPage();
      expect(screen.queryByText('Group One')).toBeNull();
    });

    it('should link back to the users list', () => {
      renderPage();
      expect(screen.getByTestId('admin-user-back').getAttribute('href')).toBe('/admin/users');
    });
  });

  describe('archiving', () => {
    it('should ask for confirmation before archiving the user', () => {
      renderPage();
      fireEvent.click(screen.getByRole('button', { name: 'Archive' }));
      expect(screen.getByRole('dialog').textContent).toContain('This will archive the account');
      expect(mocks.archiveMutate).not.toHaveBeenCalled();
    });

    it('should archive the user once the admin confirms', () => {
      renderPage();
      fireEvent.click(screen.getByRole('button', { name: 'Archive' }));
      fireEvent.click(screen.getByRole('button', { name: 'Yes' }));
      expect(mocks.archiveMutate).toHaveBeenCalledWith({ id: 'user-1' }, expect.anything());
    });

    it('should keep the confirmation open until the archive succeeds', () => {
      renderPage();
      fireEvent.click(screen.getByRole('button', { name: 'Archive' }));
      fireEvent.click(screen.getByRole('button', { name: 'Yes' }));
      expect(screen.getByRole('dialog')).toBeTruthy();
      act(() => mocks.archiveMutate.mock.lastCall![1].onSuccess());
      expect(screen.queryByRole('dialog')).toBeNull();
    });

    it('should close the confirmation without archiving when the admin declines', () => {
      renderPage();
      fireEvent.click(screen.getByRole('button', { name: 'Archive' }));
      fireEvent.click(screen.getByRole('button', { name: 'No' }));
      expect(screen.queryByRole('dialog')).toBeNull();
      expect(mocks.archiveMutate).not.toHaveBeenCalled();
    });

    it('should not let an admin archive their own account', () => {
      mocks.state.currentUser = { username: 'jane.doe' };
      renderPage();
      expect(screen.getByRole<HTMLButtonElement>('button', { name: 'Archive' }).disabled).toBe(true);
    });

    it('should offer archiving when the session has no signed-in user to compare against', () => {
      mocks.state.currentUser = null;
      renderPage();
      expect(screen.getByRole<HTMLButtonElement>('button', { name: 'Archive' }).disabled).toBe(false);
    });

    it('should unarchive an archived user without asking for confirmation', () => {
      mocks.state.user.archivedAt = new Date('2026-02-01');
      renderPage();
      fireEvent.click(screen.getByRole('button', { name: 'Unarchive' }));
      expect(mocks.unarchiveMutate).toHaveBeenCalledWith({ id: 'user-1' });
    });

    it('should not let an admin unarchive their own account', () => {
      mocks.state.currentUser = { username: 'jane.doe' };
      mocks.state.user.archivedAt = new Date('2026-02-01');
      renderPage();
      expect(screen.getByRole<HTMLButtonElement>('button', { name: 'Unarchive' }).disabled).toBe(true);
    });
  });

  describe('account form', () => {
    it('should prefill the form from the stored account and offer every group', () => {
      Object.assign(mocks.state.user, { disabled: true, email: 'jane@example.org', phoneNumber: '+15145550100' });
      renderPage();
      expect(formProps().data).toEqual({
        groupOptions: { 'group-1': 'Group One', 'group-2': 'Group Two' },
        initialValues: {
          disabled: true,
          email: 'jane@example.org',
          groupIds: new Set(['group-1']),
          phoneNumber: '+15145550100'
        },
        selectedUserBasePermission: 'STANDARD'
      });
    });

    it('should prefill blank contact details and an enabled status for fields never stored', () => {
      Object.assign(mocks.state.user, { disabled: null, email: null, phoneNumber: null });
      renderPage();
      expect(formProps().data.initialValues).toEqual({
        disabled: false,
        email: undefined,
        groupIds: new Set(['group-1']),
        phoneNumber: undefined
      });
    });

    it('should explain every distinct validation failure once', () => {
      renderPage();
      act(() => formProps().onError(validationError('Required', 'Required', 'Too short')));
      expect(errorAlert()?.textContent).toBe('Your changes were not savedRequired Too short');
    });
  });

  describe('permission drafts', () => {
    it('should preselect the scope of a new grant when the user belongs to exactly one group', () => {
      renderPage();
      expect(editorProps().drafts).toEqual([{ scope: 'group-1' }]);
    });

    it('should leave the scope of a new grant open when the user belongs to several groups', () => {
      mocks.state.user.groupIds = ['group-1', 'group-2'];
      renderPage();
      expect(editorProps().drafts).toEqual([{ scope: undefined }]);
    });

    it('should hand the stored grants to the permissions editor', () => {
      mocks.state.user.additionalPermissions = [{ action: 'read', groupId: 'group-1', subject: 'Subject' }];
      renderPage();
      expect(editorProps().permissions).toEqual([{ action: 'read', groupId: 'group-1', subject: 'Subject' }]);
    });
  });

  describe('saving', () => {
    it('should refuse to save while a permission row is half filled in', async () => {
      renderPage();
      act(() => editorProps().onDraftsChange([{ action: 'create' }]));
      const result = await submit();
      expect(result).toEqual({
        errorMessage: expect.stringContaining('A permission row is incomplete'),
        success: false
      });
      expect(mocks.mutateAsync).not.toHaveBeenCalled();
    });

    it('should highlight and explain an incomplete permission row', async () => {
      renderPage();
      act(() => editorProps().onDraftsChange([{ action: 'create' }]));
      await submit();
      expect(editorProps().highlightIncomplete).toBe(true);
      expect(errorAlert()?.textContent).toContain('A permission row is incomplete');
    });

    it('should save the account with a blank email cleared and an unchanged phone number omitted', async () => {
      Object.assign(mocks.state.user, { email: 'jane@example.org', phoneNumber: '+15145550100' });
      renderPage();
      await submit(submitData({ email: '', password: 'new-password', phoneNumber: '+15145550100' }));
      expect(mocks.mutateAsync).toHaveBeenCalledWith({
        data: {
          disabled: false,
          email: null,
          groupIds: ['group-1'],
          password: 'new-password',
          phoneNumber: undefined
        },
        id: 'user-1',
        permissions: []
      });
    });

    it('should save completed drafts as grants alongside the stored ones', async () => {
      mocks.state.user.additionalPermissions = [{ action: 'read', groupId: 'group-1', subject: 'Subject' }];
      renderPage();
      act(() => editorProps().onDraftsChange([{ action: 'create', scope: 'group-1', subject: 'Subject' }]));
      await submit();
      expect(mocks.mutateAsync.mock.lastCall?.[0]).toMatchObject({
        permissions: [
          { action: 'read', groupId: 'group-1', subject: 'Subject' },
          { action: 'create', groupId: 'group-1', subject: 'Subject' }
        ]
      });
    });

    it('should drop grants that cannot be granted or that are scoped to a group the user is leaving', async () => {
      mocks.state.user.additionalPermissions = [
        { action: 'update', groupId: null, subject: 'User' },
        { action: 'read', groupId: 'group-2', subject: 'Subject' },
        { action: 'read', groupId: null, subject: 'Instrument' }
      ];
      renderPage();
      await submit();
      expect(mocks.mutateAsync.mock.lastCall?.[0]).toMatchObject({
        permissions: [{ action: 'read', groupId: null, subject: 'Instrument' }]
      });
    });

    it('should not send grants for an administrator, who already holds every permission', async () => {
      mocks.state.user.basePermissionLevel = 'ADMIN';
      renderPage();
      await submit();
      expect(mocks.mutateAsync.mock.lastCall?.[0]).toMatchObject({ permissions: undefined });
    });

    it('should reload the user and report success once the save lands', async () => {
      renderPage();
      const result = await submit();
      expect(mocks.refetch).toHaveBeenCalledOnce();
      expect(result).toBeUndefined();
    });

    it('should show the saved grants and a fresh draft scoped to the only remaining group', async () => {
      mocks.state.user.groupIds = ['group-1', 'group-2'];
      renderPage();
      act(() => editorProps().onDraftsChange([{ action: 'create', scope: 'group-1', subject: 'Subject' }]));
      await submit();
      expect(editorProps().permissions).toEqual([{ action: 'create', groupId: 'group-1', subject: 'Subject' }]);
      expect(editorProps().drafts).toEqual([{ scope: 'group-1' }]);
    });

    it('should leave the fresh draft unscoped when the user is saved with several groups', async () => {
      renderPage();
      await submit(submitData({ groupIds: new Set(['group-1', 'group-2']) }));
      expect(editorProps().drafts).toEqual([{ scope: undefined }]);
    });

    it('should remount the account form after a save, so the password fields are cleared', async () => {
      renderPage();
      expect(mocks.formMounted).toHaveBeenCalledOnce();
      await submit();
      expect(mocks.formMounted).toHaveBeenCalledTimes(2);
    });

    it('should reset unsaved edits when the admin opens another user, so they are not saved against the wrong account', () => {
      const { rerender } = renderPage();
      act(() => editorProps().onDraftsChange([{ action: 'create' }]));
      vi.mocked(Route.useParams).mockReturnValue({ userId: 'user-2' });
      mocks.state.user = { ...mocks.makeUser(), groupIds: ['group-2'], id: 'user-2', username: 'john.roe' };
      const Component = Route.options.component!;
      rerender(<Component />);
      expect(editorProps().drafts).toEqual([{ scope: 'group-2' }]);
    });

    it('should clear an earlier error once a save goes through', async () => {
      renderPage();
      act(() => formProps().onError(validationError('Required')));
      await submit();
      expect(errorAlert()).toBeNull();
    });

    it('should explain a failed save and let the admin try again', async () => {
      mocks.mutateAsync.mockRejectedValue(new Error('Network Error'));
      renderPage();
      const result = await submit();
      expect(result).toEqual({ errorMessage: expect.stringContaining('Could not save all changes'), success: false });
      expect(errorAlert()?.textContent).toContain('Could not save all changes');
      expect(saveButton().disabled).toBe(false);
    });

    it('should lock the save controls while a save is in flight', () => {
      mocks.mutateAsync.mockReturnValue(new Promise(() => undefined));
      renderPage();
      act(() => {
        void formProps().onSubmit(submitData());
      });
      expect(saveButton().disabled).toBe(true);
      expect(editorProps().isSaving).toBe(true);
    });

    it('should ignore a second submit while a save is in flight, so the account is not saved twice', async () => {
      mocks.mutateAsync.mockReturnValue(new Promise(() => undefined));
      renderPage();
      act(() => {
        void formProps().onSubmit(submitData());
      });
      expect(await submit()).toBeUndefined();
      expect(mocks.mutateAsync).toHaveBeenCalledOnce();
    });
  });
});
