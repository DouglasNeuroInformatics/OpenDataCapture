import type { Permissions } from '@opendatacapture/schemas/core';
import { describe, expect, it } from 'vitest';

import {
  $AddPermissionFormData,
  ALL_GROUPS,
  grantableActions,
  grantableSubjects,
  toUserPermission,
  withoutPermission,
  withPermission
} from '../permissions';

describe('$AddPermissionFormData', () => {
  it('should require a scope for a resource that can be confined to a group', () => {
    const result = $AddPermissionFormData.safeParse({ action: 'read', subject: 'Subject' });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.path).toEqual(['scope']);
  });

  it('should accept a resource that cannot be confined to a group without a scope', () => {
    expect($AddPermissionFormData.safeParse({ action: 'create', subject: 'Instrument' }).success).toBe(true);
  });

  it('should accept a scoped grant', () => {
    expect($AddPermissionFormData.safeParse({ action: 'read', scope: 'group-1', subject: 'Subject' }).success).toBe(
      true
    );
  });

  it('should refuse a grant that writes users, which the permissions route would refuse too', () => {
    const result = $AddPermissionFormData.safeParse({ action: 'update', scope: 'group-1', subject: 'User' });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.path).toEqual(['action']);
  });
});

describe('grantableActions', () => {
  it('should offer every action before a resource is chosen', () => {
    expect(grantableActions(undefined)).toEqual(['create', 'delete', 'manage', 'read', 'update']);
  });

  it('should offer only read on User, since every route that writes a user is admin-only', () => {
    expect(grantableActions('User')).toEqual(['read']);
  });
});

describe('grantableSubjects', () => {
  it('should leave User out once a write is chosen', () => {
    expect(grantableSubjects('update')).not.toContain('User');
  });

  it('should keep User for read', () => {
    expect(grantableSubjects('read')).toContain('User');
  });
});

describe('toUserPermission', () => {
  it('should store the chosen group', () => {
    expect(toUserPermission({ action: 'read', scope: 'group-1', subject: 'Subject' })).toEqual({
      action: 'read',
      groupId: 'group-1',
      subject: 'Subject'
    });
  });

  it('should store null when every group was chosen', () => {
    expect(toUserPermission({ action: 'read', scope: ALL_GROUPS, subject: 'Subject' })).toMatchObject({
      groupId: null
    });
  });

  it('should store null for a resource that cannot be confined, whatever scope is left over', () => {
    expect(toUserPermission({ action: 'read', scope: 'group-1', subject: 'Instrument' })).toMatchObject({
      groupId: null
    });
  });
});

describe('withPermission', () => {
  const permissions: Permissions = [{ action: 'read', groupId: 'group-1', subject: 'Subject' }];

  it('should append a new grant', () => {
    expect(withPermission(permissions, { action: 'read', groupId: 'group-2', subject: 'Subject' })).toHaveLength(2);
  });

  it('should not duplicate a grant the user already holds', () => {
    expect(withPermission(permissions, { action: 'read', groupId: 'group-1', subject: 'Subject' })).toBe(permissions);
  });
});

describe('withoutPermission', () => {
  it('should remove only the grant at the given index', () => {
    const permissions: Permissions = [
      { action: 'read', groupId: 'group-1', subject: 'Subject' },
      { action: 'read', groupId: null, subject: 'Subject' }
    ];
    expect(withoutPermission(permissions, 0)).toEqual([permissions[1]]);
  });
});
