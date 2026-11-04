import type { PermissionSetRule } from '@opendatacapture/schemas/permission-set';
import { describe, expect, it } from 'vitest';

import { createRuleDraft, isIncompleteRuleDraft, toPermissionSetRule, withRuleDrafts } from '../permission-set-rules';

describe('createRuleDraft', () => {
  it("should start a row confined to the holder's groups, the narrower of the two scopes", () => {
    expect(createRuleDraft()).toEqual({ scope: 'HOLDER_GROUPS' });
  });
});

describe('toPermissionSetRule', () => {
  it('should keep the chosen scope for a resource a group owns', () => {
    expect(toPermissionSetRule({ action: 'read', scope: 'HOLDER_GROUPS', subject: 'Subject' })).toEqual({
      action: 'read',
      scope: 'HOLDER_GROUPS',
      subject: 'Subject'
    });
  });

  it('should apply a rule on a resource no group owns to every group, whatever scope is left over', () => {
    expect(toPermissionSetRule({ action: 'read', scope: 'HOLDER_GROUPS', subject: 'Instrument' })).toMatchObject({
      scope: 'ALL_GROUPS'
    });
  });

  it('should make nothing of a row missing its action or resource', () => {
    expect(toPermissionSetRule({ action: 'read', scope: 'ALL_GROUPS' })).toBeNull();
    expect(toPermissionSetRule({ scope: 'ALL_GROUPS', subject: 'Subject' })).toBeNull();
  });

  it('should make nothing of manage all, which a set may not contain', () => {
    expect(toPermissionSetRule({ action: 'manage', scope: 'ALL_GROUPS', subject: 'all' })).toBeNull();
  });
});

describe('isIncompleteRuleDraft', () => {
  it('should not flag an untouched row, so it never blocks a save', () => {
    expect(isIncompleteRuleDraft(createRuleDraft())).toBe(false);
  });

  it('should flag a started row missing its resource', () => {
    expect(isIncompleteRuleDraft({ action: 'read', scope: 'HOLDER_GROUPS' })).toBe(true);
  });

  it('should not flag a complete row', () => {
    expect(isIncompleteRuleDraft({ action: 'read', scope: 'HOLDER_GROUPS', subject: 'Subject' })).toBe(false);
  });
});

describe('withRuleDrafts', () => {
  const rules: PermissionSetRule[] = [{ action: 'read', scope: 'HOLDER_GROUPS', subject: 'Subject' }];

  it('should add every complete row after the existing rules', () => {
    expect(withRuleDrafts(rules, [{ action: 'read', scope: 'ALL_GROUPS', subject: 'Instrument' }])).toEqual([
      ...rules,
      { action: 'read', scope: 'ALL_GROUPS', subject: 'Instrument' }
    ]);
  });

  it('should skip unfinished rows and rules already in the set, which the API would refuse as repeats', () => {
    expect(withRuleDrafts(rules, [createRuleDraft(), { ...rules[0]! }])).toBe(rules);
  });
});
