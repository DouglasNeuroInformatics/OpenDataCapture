import {
  $AppAction,
  $AppSubjectName,
  isGrantablePermission,
  isGroupScopableSubject
} from '@opendatacapture/schemas/core';
import type { AppAction, AppSubjectName, Permissions, UserPermission } from '@opendatacapture/schemas/core';
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
    if (!isGrantablePermission(ctx.value)) {
      ctx.issues.push({
        code: 'custom',
        input: ctx.value.action,
        message: 'This action cannot be granted on this resource',
        path: ['action']
      });
    }
  });

/** Every action, or once a resource is chosen, only those a grant on it can use. */
const grantableActions = (subject: AppSubjectName | undefined): AppAction[] =>
  $AppAction.options.filter((action) => subject === undefined || isGrantablePermission({ action, subject }));

/** Every resource, or once an action is chosen, only those a grant of it can reach. */
const grantableSubjects = (action: AppAction | undefined): AppSubjectName[] =>
  $AppSubjectName.options.filter((subject) => action === undefined || isGrantablePermission({ action, subject }));

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

export {
  $AddPermissionFormData,
  ALL_GROUPS,
  grantableActions,
  grantableSubjects,
  toUserPermission,
  withoutPermission,
  withPermission
};
export type { AddPermissionFormData };
