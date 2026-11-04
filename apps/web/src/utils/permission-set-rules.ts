import type { AppAction, AppSubjectName } from '@opendatacapture/schemas/core';
import { isGroupScopableSubject } from '@opendatacapture/schemas/core';
import { isPermissionSetGrantable } from '@opendatacapture/schemas/permission-set';
import type { PermissionSetRule, PermissionSetScope } from '@opendatacapture/schemas/permission-set';

/** A rule row being filled in. Its scope is always chosen, so only the action and resource can be missing. */
type PermissionSetRuleDraft = {
  action?: AppAction;
  scope: PermissionSetScope;
  subject?: AppSubjectName;
};

/** A fresh row, confined to the holder's groups until the admin chooses otherwise. */
const createRuleDraft = (): PermissionSetRuleDraft => ({ scope: 'HOLDER_GROUPS' });

/**
 * The rule a row stands for, or null until its action and resource are chosen and a set may contain
 * them. A resource no group owns applies to every group, whatever scope the row was left with.
 */
const toPermissionSetRule = ({ action, scope, subject }: PermissionSetRuleDraft): null | PermissionSetRule => {
  if (action === undefined || subject === undefined || !isPermissionSetGrantable({ action, subject })) {
    return null;
  }
  return { action, scope: isGroupScopableSubject(subject) ? scope : 'ALL_GROUPS', subject };
};

/** A row with an action or resource chosen that is not yet a rule. The scope alone does not count as started. */
const isIncompleteRuleDraft = (draft: PermissionSetRuleDraft): boolean => {
  return (draft.action !== undefined || draft.subject !== undefined) && toPermissionSetRule(draft) === null;
};

const isSameRule = (a: PermissionSetRule, b: PermissionSetRule): boolean => {
  return a.action === b.action && a.subject === b.subject && a.scope === b.scope;
};

/** The rules with every complete row added, each at most once, since the API refuses a repeated rule. */
const withRuleDrafts = (rules: PermissionSetRule[], drafts: PermissionSetRuleDraft[]): PermissionSetRule[] => {
  return drafts.reduce((result, draft) => {
    const rule = toPermissionSetRule(draft);
    return rule === null || result.some((existing) => isSameRule(existing, rule)) ? result : [...result, rule];
  }, rules);
};

export { createRuleDraft, isIncompleteRuleDraft, toPermissionSetRule, withRuleDrafts };
export type { PermissionSetRuleDraft };
