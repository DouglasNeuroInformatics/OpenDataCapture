import { describe, expect, it } from 'vitest';

import {
  $CreatePermissionSetData,
  $PermissionSet,
  $PermissionSetRule,
  $PermissionSetSummary,
  $UpdatePermissionSetData,
  isPermissionSetGrantable
} from '../permission-set.js';

const STORED_SET = {
  createdAt: new Date(),
  id: 'set-1',
  name: 'Research Assistant',
  rules: [{ action: 'read', scope: 'HOLDER_GROUPS', subject: 'Subject' }],
  updatedAt: new Date()
};

describe('$PermissionSetRule', () => {
  it('should accept a rule confined to the holder groups on a resource that belongs to a group', () => {
    expect($PermissionSetRule.safeParse({ action: 'read', scope: 'HOLDER_GROUPS', subject: 'Subject' }).success).toBe(
      true
    );
  });

  it('should reject a rule confined to the holder groups on a resource no group owns', () => {
    const result = $PermissionSetRule.safeParse({ action: 'read', scope: 'HOLDER_GROUPS', subject: 'Instrument' });
    expect(result.error?.issues[0]?.path).toEqual(['scope']);
  });

  it('should accept a rule on a resource no group owns when it applies to every group', () => {
    expect($PermissionSetRule.safeParse({ action: 'read', scope: 'ALL_GROUPS', subject: 'Instrument' }).success).toBe(
      true
    );
  });
});

describe('$PermissionSet', () => {
  it('should accept a stored rule a set may no longer contain, so a set saved before still parses', () => {
    const rules = [{ action: 'manage', scope: 'ALL_GROUPS', subject: 'all' }];
    expect($PermissionSet.safeParse({ ...STORED_SET, rules }).success).toBe(true);
  });
});

describe('$PermissionSetSummary', () => {
  it('should reject a negative holder count', () => {
    expect($PermissionSetSummary.safeParse({ ...STORED_SET, holderCount: -1 }).success).toBe(false);
  });

  it('should accept a set with no holders', () => {
    expect($PermissionSetSummary.safeParse({ ...STORED_SET, holderCount: 0 }).success).toBe(true);
  });
});

describe('isPermissionSetGrantable', () => {
  it('should refuse manage all, which would make every holder an administrator', () => {
    expect(isPermissionSetGrantable({ action: 'manage', subject: 'all' })).toBe(false);
  });

  it('should refuse a user write, which only an administrator can make', () => {
    expect(isPermissionSetGrantable({ action: 'update', subject: 'User' })).toBe(false);
  });

  it('should allow every other action on every resource, as a per-user grant would', () => {
    expect(isPermissionSetGrantable({ action: 'read', subject: 'all' })).toBe(true);
    expect(isPermissionSetGrantable({ action: 'manage', subject: 'Subject' })).toBe(true);
  });
});

describe('$CreatePermissionSetData', () => {
  const data = { name: 'Research Assistant', rules: [{ action: 'read', scope: 'HOLDER_GROUPS', subject: 'Subject' }] };

  it('should accept a named set with one rule', () => {
    expect($CreatePermissionSetData.safeParse(data).success).toBe(true);
  });

  it('should reject a set with no rules, which would grant nothing', () => {
    expect($CreatePermissionSetData.safeParse({ ...data, rules: [] }).success).toBe(false);
  });

  it('should reject a blank name, which would leave the set unidentifiable in the list', () => {
    expect($CreatePermissionSetData.safeParse({ ...data, name: '' }).success).toBe(false);
  });

  it('should reject manage all, naming the offending rule', () => {
    const rules = [...data.rules, { action: 'manage', scope: 'ALL_GROUPS', subject: 'all' }];
    const result = $CreatePermissionSetData.safeParse({ ...data, rules });
    expect(result.error?.issues).toMatchObject([
      { message: 'A permission set cannot make its holders administrators', path: ['rules', 1] }
    ]);
  });

  it('should reject a user write, naming the offending rule', () => {
    const rules = [{ action: 'update', scope: 'HOLDER_GROUPS', subject: 'User' }];
    const result = $CreatePermissionSetData.safeParse({ ...data, rules });
    expect(result.error?.issues).toMatchObject([
      {
        message: 'Only an administrator can create, modify or delete users, so this permission would do nothing',
        path: ['rules', 0]
      }
    ]);
  });

  it('should reject a rule repeated in the set, naming the repeat', () => {
    const result = $CreatePermissionSetData.safeParse({ ...data, rules: [...data.rules, ...data.rules] });
    expect(result.error?.issues).toMatchObject([{ path: ['rules', 1] }]);
  });

  it('should accept the same rule at two scopes, since they grant different rows', () => {
    const rules = [...data.rules, { action: 'read', scope: 'ALL_GROUPS', subject: 'Subject' }];
    expect($CreatePermissionSetData.safeParse({ ...data, rules }).success).toBe(true);
  });
});

describe('$UpdatePermissionSetData', () => {
  it('should accept a rename alone, leaving the rules as they are', () => {
    expect($UpdatePermissionSetData.safeParse({ name: 'Renamed' }).success).toBe(true);
  });

  it('should apply the same rule check as a create when the rules are replaced', () => {
    const rules = [{ action: 'manage', scope: 'ALL_GROUPS', subject: 'all' }];
    expect($UpdatePermissionSetData.safeParse({ rules }).success).toBe(false);
  });
});
