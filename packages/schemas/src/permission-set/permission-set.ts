import { z } from 'zod/v4';

import {
  $AppAction,
  $AppSubjectName,
  $BaseModel,
  isGrantablePermission,
  isGroupScopableSubject
} from '../core/core.js';

import type { UserPermission } from '../core/core.js';

/**
 * Where a rule in a permission set applies, relative to whoever holds the set: the groups the holder
 * belongs to when they sign in, or every group. A set names no group itself, so one set can serve
 * users in different groups.
 */
const $PermissionSetScope = z.enum(['ALL_GROUPS', 'HOLDER_GROUPS']);

/**
 * One rule of a permission set, as stored. This is the read model, so like `$UserPermission` it does
 * not apply {@link isPermissionSetGrantable}: a set stored before a rule was tightened must still parse.
 */
const $PermissionSetRule = z
  .object({
    action: $AppAction,
    scope: $PermissionSetScope,
    subject: $AppSubjectName
  })
  .check((ctx) => {
    if (ctx.value.scope === 'HOLDER_GROUPS' && !isGroupScopableSubject(ctx.value.subject)) {
      ctx.issues.push({
        code: 'custom',
        input: ctx.value.scope,
        message: 'This resource cannot be scoped to a group',
        path: ['scope']
      });
    }
  });

/**
 * Whether a permission set may contain a rule. Everything a per-user grant may name, except
 * `manage all`: that makes its holder an administrator, so a single edit to the set would promote
 * every holder at once. The `ADMIN` permission level exists for that.
 */
const isPermissionSetGrantable = ({ action, subject }: Pick<UserPermission, 'action' | 'subject'>): boolean => {
  return isGrantablePermission({ action, subject }) && !(action === 'manage' && subject === 'all');
};

/** The rules a write may store: at least one, none repeated, and each one a set may contain. */
const $GrantablePermissionSetRules = z
  .array($PermissionSetRule)
  .min(1)
  .check((ctx) => {
    const seen = new Set<string>();
    ctx.value.forEach((rule, index) => {
      if (!isPermissionSetGrantable(rule)) {
        ctx.issues.push({
          code: 'custom',
          input: rule,
          message: isGrantablePermission(rule)
            ? 'A permission set cannot make its holders administrators'
            : 'Only an administrator can create, modify or delete users, so this permission would do nothing',
          path: [index]
        });
      }
      const key = [rule.action, rule.subject, rule.scope].join(' ');
      if (seen.has(key)) {
        ctx.issues.push({ code: 'custom', input: rule, message: 'This rule is already in the set', path: [index] });
      }
      seen.add(key);
    });
  });

const $PermissionSet = $BaseModel.extend({
  name: z.string().min(1),
  rules: $PermissionSetRule.array()
});

/** What the permission set routes return: the set, and how many users hold it. */
const $PermissionSetSummary = $PermissionSet.extend({
  holderCount: z.number().int().nonnegative()
});

const $CreatePermissionSetData = z.object({
  name: z.string().min(1),
  rules: $GrantablePermissionSetRules
});

const $UpdatePermissionSetData = $CreatePermissionSetData.partial();

export type $CreatePermissionSetData = z.infer<typeof $CreatePermissionSetData>;
export type PermissionSet = z.infer<typeof $PermissionSet>;
export type PermissionSetRule = z.infer<typeof $PermissionSetRule>;
export type PermissionSetScope = z.infer<typeof $PermissionSetScope>;
export type PermissionSetSummary = z.infer<typeof $PermissionSetSummary>;
export type $UpdatePermissionSetData = z.infer<typeof $UpdatePermissionSetData>;

export {
  $CreatePermissionSetData,
  $PermissionSet,
  $PermissionSetRule,
  $PermissionSetScope,
  $PermissionSetSummary,
  $UpdatePermissionSetData,
  isPermissionSetGrantable
};
