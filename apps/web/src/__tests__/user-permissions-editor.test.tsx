import type { User } from '@opendatacapture/schemas/user';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { UserPermissionsEditor } from '@/components/UserPermissionsEditor';

import '@/services/i18n';

const mocks = vi.hoisted(() => ({ mutate: vi.fn() }));

vi.mock('@/hooks/useUpdateUserPermissionsMutation', () => ({
  useUpdateUserPermissionsMutation: () => ({ isPending: false, mutate: mocks.mutate })
}));

const groups = [
  { id: 'group-1', name: 'Group One' },
  { id: 'group-2', name: 'Group Two' }
];

const user: User = {
  additionalPermissions: [
    { action: 'read', groupId: 'group-1', subject: 'Subject' },
    { action: 'create', groupId: null, subject: 'Instrument' }
  ],
  basePermissionLevel: 'STANDARD',
  createdAt: new Date('2026-01-01'),
  firstName: 'Jane',
  groupIds: ['group-1'],
  id: 'user-1',
  lastName: 'Doe',
  updatedAt: new Date('2026-01-01'),
  username: 'jane.doe'
};

describe('UserPermissionsEditor', () => {
  beforeEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it('should list every grant, naming the group a scoped one is confined to', () => {
    render(<UserPermissionsEditor groups={groups} user={user} />);
    expect(screen.getAllByTestId('user-permission-row')).toHaveLength(2);
    expect(screen.getByText('Group One')).toBeTruthy();
  });

  it('should mark an unscoped grant as applying to all groups', () => {
    render(<UserPermissionsEditor groups={groups} user={user} />);
    expect(screen.getByText('All Groups')).toBeTruthy();
  });

  it('should say that a change waits for the next sign-in, since permissions are frozen into the token', () => {
    render(<UserPermissionsEditor groups={groups} user={user} />);
    expect(screen.getByTestId('user-permissions-signin-note')).toBeTruthy();
  });

  it('should save the full set minus the removed grant, since the route replaces what is stored', () => {
    render(<UserPermissionsEditor groups={groups} user={user} />);
    fireEvent.click(screen.getAllByTestId('user-permission-remove')[0]!);
    expect(mocks.mutate.mock.lastCall?.[0]).toEqual({
      id: 'user-1',
      permissions: [{ action: 'create', groupId: null, subject: 'Instrument' }]
    });
  });

  it('should still offer the add row when the user holds no grants', () => {
    render(<UserPermissionsEditor groups={groups} user={{ ...user, additionalPermissions: [] }} />);
    expect(screen.queryAllByTestId('user-permission-row')).toHaveLength(0);
    expect(screen.getByTestId('add-permission-row')).toBeTruthy();
  });

  it('should offer no scope until a resource that takes one is chosen', () => {
    render(<UserPermissionsEditor groups={groups} user={user} />);
    expect(screen.getByTestId('add-permission-row')).toBeTruthy();
    expect(screen.queryByTestId('scope-select-trigger')).toBeNull();
  });

  it('should keep the add button disabled until an action and a resource are chosen', () => {
    render(<UserPermissionsEditor groups={groups} user={user} />);
    const addButton = screen.getByRole('button', { name: 'Add Permission' });
    expect(addButton.hasAttribute('disabled')).toBe(true);
  });

  it('should replace the editor with a notice for an administrator, who already holds everything', () => {
    render(<UserPermissionsEditor groups={groups} user={{ ...user, basePermissionLevel: 'ADMIN' }} />);
    expect(screen.getByTestId('user-permissions-admin-notice')).toBeTruthy();
    expect(screen.queryByTestId('user-permissions-table')).toBeNull();
    expect(screen.queryByTestId('add-permission-row')).toBeNull();
  });
});
