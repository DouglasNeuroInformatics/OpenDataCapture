import { useState } from 'react';
import type { ComponentProps } from 'react';

import type { Permissions } from '@opendatacapture/schemas/core';
import type { User } from '@opendatacapture/schemas/user';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { UserPermissionsEditor } from '@/components/UserPermissionsEditor';
import type { PermissionDraft } from '@/utils/permissions';

import '@/services/i18n';

const onPermissionsChange = vi.fn();
const onDraftsChange = vi.fn();

const Editor = ({
  groups,
  highlightIncomplete,
  user
}: Pick<ComponentProps<typeof UserPermissionsEditor>, 'groups' | 'highlightIncomplete' | 'user'>) => {
  const [permissions, setPermissions] = useState<Permissions>(user.additionalPermissions);
  const [drafts, setDrafts] = useState<PermissionDraft[]>([
    { scope: user.groupIds.length === 1 ? user.groupIds[0] : undefined }
  ]);
  return (
    <UserPermissionsEditor
      drafts={drafts}
      groups={groups}
      highlightIncomplete={highlightIncomplete}
      permissions={permissions}
      user={user}
      onDraftsChange={(drafts) => {
        setDrafts(drafts);
        onDraftsChange(drafts);
      }}
      onPermissionsChange={(permissions) => {
        setPermissions(permissions);
        onPermissionsChange(permissions);
      }}
    />
  );
};

/** Opens one of the add-row selects from the keyboard, since happy-dom dispatches no pointer capture. */
const choose = (field: 'action' | 'scope' | 'subject', value: string, rowIndex = 0) => {
  fireEvent.keyDown(screen.getAllByTestId(`${field}-select-trigger`)[rowIndex]!, { key: 'Enter' });
  fireEvent.click(screen.getByTestId(`${field}-select-item-${value}`));
};

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
    render(<Editor groups={groups} user={user} />);
    expect(screen.getAllByTestId('user-permission-row')).toHaveLength(2);
    expect(screen.getByText('Group One')).toBeTruthy();
  });

  it('should mark an unscoped grant as applying to all groups', () => {
    render(<Editor groups={groups} user={user} />);
    expect(screen.getByText('All Groups')).toBeTruthy();
  });

  it('should say that a change waits for the next sign-in, since permissions are frozen into the token', () => {
    render(<Editor groups={groups} user={user} />);
    expect(screen.getByTestId('user-permissions-signin-note')).toBeTruthy();
  });

  it('should stage removal without saving', () => {
    render(<Editor groups={groups} user={user} />);
    fireEvent.click(screen.getAllByTestId('user-permission-remove')[0]!);
    expect(onPermissionsChange).toHaveBeenCalledWith([{ action: 'create', groupId: null, subject: 'Instrument' }]);
  });

  it('should still offer the add row when the user holds no grants', () => {
    render(<Editor groups={groups} user={{ ...user, additionalPermissions: [] }} />);
    expect(screen.queryAllByTestId('user-permission-row')).toHaveLength(0);
    expect(screen.getByTestId('add-permission-row')).toBeTruthy();
  });

  it('should offer no scope until a resource that takes one is chosen', () => {
    render(<Editor groups={groups} user={user} />);
    expect(screen.getByTestId('add-permission-row')).toBeTruthy();
    expect(screen.queryByTestId('scope-select-trigger')).toBeNull();
  });

  it('should add an empty row without committing any permission', () => {
    render(<Editor groups={groups} user={user} />);
    const addButton = screen.getByRole('button', { name: 'Add Permission' });
    fireEvent.click(addButton);
    expect(screen.getAllByTestId('add-permission-row')).toHaveLength(2);
    expect(onPermissionsChange).not.toHaveBeenCalled();
  });

  it('should stage a complete row without requiring the plus button', () => {
    render(<Editor groups={groups} user={user} />);
    choose('action', 'read');
    choose('subject', 'User');
    expect(onDraftsChange.mock.lastCall?.[0]).toEqual([{ action: 'read', scope: 'group-1', subject: 'User' }]);
    expect(onPermissionsChange).not.toHaveBeenCalled();
  });

  it('should stage the group chosen as the scope, so a grant can be confined to any group the user belongs to', () => {
    render(<Editor groups={groups} user={{ ...user, groupIds: ['group-1', 'group-2'] }} />);
    choose('action', 'read');
    choose('subject', 'Subject');
    choose('scope', 'group-2');
    expect(onDraftsChange.mock.lastCall?.[0]).toEqual([{ action: 'read', scope: 'group-2', subject: 'Subject' }]);
  });

  it('should leave the other drafts untouched when one row changes', () => {
    render(<Editor groups={groups} user={user} />);
    fireEvent.click(screen.getByRole('button', { name: 'Add Permission' }));
    choose('action', 'read', 1);
    expect(onDraftsChange.mock.lastCall?.[0]).toEqual([{ scope: 'group-1' }, { action: 'read', scope: 'group-1' }]);
  });

  it('should show the raw group id for a grant scoped to a group it cannot name, so the grant is still identifiable', () => {
    render(
      <Editor
        groups={groups}
        user={{ ...user, additionalPermissions: [{ action: 'read', groupId: 'group-9', subject: 'Subject' }] }}
      />
    );
    expect(screen.getByTestId('user-permission-scope').textContent).toBe('group-9');
  });

  it('should remove a draft without changing existing grants', () => {
    render(<Editor groups={groups} user={user} />);
    fireEvent.click(screen.getByTestId('permission-draft-remove'));
    expect(screen.queryAllByTestId('add-permission-row')).toHaveLength(0);
    expect(onPermissionsChange).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'Add Permission' }));
    expect(screen.getAllByTestId('add-permission-row')).toHaveLength(1);
  });

  it('should flag a started but unfinished row once a save has been refused', () => {
    render(<Editor highlightIncomplete groups={groups} user={{ ...user, groupIds: ['group-1', 'group-2'] }} />);
    expect(screen.queryByTestId('permission-drafts-incomplete')).toBeNull();
    choose('action', 'read');
    choose('subject', 'Subject');
    expect(screen.getByTestId('add-permission-row').getAttribute('aria-invalid')).toBe('true');
    expect(screen.getByTestId('permission-drafts-incomplete')).toBeTruthy();
  });

  it('should not flag an unfinished row before any save is attempted', () => {
    render(<Editor groups={groups} user={{ ...user, groupIds: ['group-1', 'group-2'] }} />);
    choose('action', 'read');
    expect(screen.getByTestId('add-permission-row').getAttribute('aria-invalid')).toBeNull();
    expect(screen.queryByTestId('permission-drafts-incomplete')).toBeNull();
  });

  describe('a grant stored before it stopped being grantable', () => {
    const holder: User = {
      ...user,
      additionalPermissions: [...user.additionalPermissions, { action: 'update', groupId: null, subject: 'User' }]
    };

    it('should be marked as having no effect, with a note saying it will be removed', () => {
      render(<Editor groups={groups} user={holder} />);
      expect(screen.getAllByTestId('user-permission-ineffective')).toHaveLength(1);
      expect(screen.getByTestId('user-permissions-ineffective-note')).toBeTruthy();
    });

    it('should preserve other grants while staging removal', () => {
      render(<Editor groups={groups} user={holder} />);
      fireEvent.click(screen.getAllByTestId('user-permission-remove')[0]!);
      expect(onPermissionsChange.mock.lastCall?.[0]).toEqual([
        { action: 'create', groupId: null, subject: 'Instrument' },
        { action: 'update', groupId: null, subject: 'User' }
      ]);
    });
  });

  it('should not mark or note anything when every grant has an effect', () => {
    render(<Editor groups={groups} user={user} />);
    expect(screen.queryByTestId('user-permission-ineffective')).toBeNull();
    expect(screen.queryByTestId('user-permissions-ineffective-note')).toBeNull();
  });

  it('should warn that Manage (All) on All makes the user an administrator', () => {
    render(<Editor groups={groups} user={user} />);
    choose('action', 'manage');
    expect(screen.queryByTestId('manage-all-warning')).toBeNull();
    choose('subject', 'all');
    expect(screen.getByTestId('manage-all-warning')).toBeTruthy();
  });

  it('should replace the editor with a notice for an administrator, who already holds everything', () => {
    render(<Editor groups={groups} user={{ ...user, basePermissionLevel: 'ADMIN' }} />);
    expect(screen.getByTestId('user-permissions-admin-notice')).toBeTruthy();
    expect(screen.queryByTestId('user-permissions-table')).toBeNull();
    expect(screen.queryByTestId('add-permission-row')).toBeNull();
  });
});
