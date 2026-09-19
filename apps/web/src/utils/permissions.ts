import { $AppAction, $AppSubjectName, isGroupScopableSubject } from '@opendatacapture/schemas/core';
import type { Permissions, UserPermission } from '@opendatacapture/schemas/core';
import { z } from 'zod/v4';

/** The scope option standing for every group. A group id is an ObjectId, so the two cannot collide. */
const ALL_GROUPS = '__all__';

type AddPermissionFormData = z.infer<typeof $AddPermissionFormData>;
const $AddPermissionFormData = z
  .object({
    action: $AppAction,
    scope: z.string().optional(),
    subject: $AppSubjectName
  })
  .check((ctx) => {
    if (isGroupScopableSubject(ctx.value.subject) && ctx.value.scope === undefined) {
      ctx.issues.push({
        code: 'invalid_type',
        expected: 'string',
        input: ctx.value.scope,
        path: ['scope'],
        received: 'undefined'
      });
    }
  });

/** The stored form of a grant: null when the resource cannot be scoped, or every group was chosen. */
const toUserPermission = ({ action, scope, subject }: AddPermissionFormData): UserPermission => ({
  action,
  groupId: isGroupScopableSubject(subject) && scope !== undefined && scope !== ALL_GROUPS ? scope : null,
  subject
});

const isSamePermission = (a: UserPermission, b: UserPermission): boolean =>
  a.action === b.action && a.subject === b.subject && a.groupId === b.groupId;

const withPermission = (permissions: Permissions, permission: UserPermission): Permissions =>
  permissions.some((existing) => isSamePermission(existing, permission)) ? permissions : [...permissions, permission];

const withoutPermission = (permissions: Permissions, index: number): Permissions =>
  permissions.filter((_, i) => i !== index);

export { $AddPermissionFormData, ALL_GROUPS, toUserPermission, withoutPermission, withPermission };
export type { AddPermissionFormData };
