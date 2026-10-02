import type { Permissions } from '@opendatacapture/schemas/core';
import { describe, expect, it } from 'vitest';

import {
  $AddPermissionFormData,
  ALL_GROUPS,
  grantableActions,
  grantableSubjects,
  isIncompleteDraft,
  toUserPermission,
  withoutPermission,
  withPermission,
  withPermissionDrafts
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

describe('isIncompleteDraft', () => {
  it('should not flag a blank row, even with its scope preselected, so an untouched add row never blocks a save', () => {
    expect(isIncompleteDraft({})).toBe(false);
    expect(isIncompleteDraft({ scope: 'group-1' })).toBe(false);
  });

  it('should flag a started row missing its resource', () => {
    expect(isIncompleteDraft({ action: 'read' })).toBe(true);
  });

  it('should flag a scopable grant with no scope chosen, so it is not silently dropped', () => {
    expect(isIncompleteDraft({ action: 'read', subject: 'Subject' })).toBe(true);
  });

  it('should not flag a complete row', () => {
    expect(isIncompleteDraft({ action: 'create', subject: 'Instrument' })).toBe(false);
    expect(isIncompleteDraft({ action: 'read', scope: 'group-1', subject: 'Subject' })).toBe(false);
  });
});

describe('withPermissionDrafts', () => {
  it('should include every complete row without requiring plus', () => {
    expect(
      withPermissionDrafts(
        [],
        [
          { action: 'read', scope: 'group-1', subject: 'User' },
          { action: 'create', subject: 'Instrument' }
        ]
      )
    ).toEqual([
      { action: 'read', groupId: 'group-1', subject: 'User' },
      { action: 'create', groupId: null, subject: 'Instrument' }
    ]);
  });

  it('should ignore unfinished rows and avoid duplicate grants', () => {
    const permissions: Permissions = [{ action: 'read', groupId: 'group-1', subject: 'User' }];
    expect(
      withPermissionDrafts(permissions, [
        {},
        { action: 'read', subject: 'Subject' },
        { action: 'read', scope: 'group-1', subject: 'User' }
      ])
    ).toEqual(permissions);
  });
});
