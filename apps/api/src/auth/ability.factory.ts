import { AbilityBuilder } from '@casl/ability';
import { createPrismaAbility } from '@casl/prisma';
import { LoggingService } from '@douglasneuroinformatics/libnest';
import { Injectable } from '@nestjs/common';
import type { TokenPayload } from '@opendatacapture/schemas/auth';
import { isGroupScopableSubject } from '@opendatacapture/schemas/core';
import type { GroupScopableSubjectName, UserPermission } from '@opendatacapture/schemas/core';
import type { PermissionSetRule } from '@opendatacapture/schemas/permission-set';

import type { PrismaModelWhereInputMap } from '@/core/prisma';

import { createAppAbility, detectAppSubject } from './ability.utils';

import type { AppAbility, Permission } from './auth.types';

/**
 * The condition confining a granted permission to some groups, per model that can carry one: one
 * group for a per-user grant, the holder's groups for a permission set rule. The fields are the same
 * ones the group manager rules below use. Typed over the schema's list, so a subject made scopable
 * there fails to compile here until its group field is named.
 */
const GROUP_SCOPED_CONDITIONS = {
  Assignment: (groupIds) => ({ groupId: { in: groupIds } }),
  Group: (groupIds) => ({ id: { in: groupIds } }),
  InstrumentRecord: (groupIds) => ({ groupId: { in: groupIds } }),
  InstrumentRepo: (groupIds) => ({ groupIds: { hasSome: groupIds } }),
  Session: (groupIds) => ({ groupId: { in: groupIds } }),
  Subject: (groupIds) => ({ groupIds: { hasSome: groupIds } }),
  User: (groupIds) => ({ groupIds: { hasSome: groupIds } })
} satisfies { [K in GroupScopableSubjectName]: (groupIds: string[]) => NonNullable<PrismaModelWhereInputMap[K]> };

/**
 * Grants a per-user permission or a permission set rule in every group when `groupIds` is null, and
 * only within `groupIds` otherwise. The schemas refuse a group scope on a resource no group owns; a
 * stored rule that has one anyway is applied under neither reading, since either one silently changes
 * what it grants.
 */
function grantWithin(
  ability: AbilityBuilder<AppAbility>,
  { action, subject }: Pick<UserPermission, 'action' | 'subject'>,
  groupIds: null | string[],
  source: 'permission' | 'permission set rule'
) {
  if (groupIds === null) {
    ability.can(action, subject);
  } else if (isGroupScopableSubject(subject)) {
    ability.can(action, subject, GROUP_SCOPED_CONDITIONS[subject](groupIds));
  } else {
    throw new Error(`Cannot confine ${source} '${action} ${subject}' to groups [${groupIds.join(', ')}]`);
  }
}

@Injectable()
export class AbilityFactory {
  constructor(private readonly loggingService: LoggingService) {}

  /**
   * `permissionSetRules` are the rules of the set the user holds, read at sign-in rather than carried
   * on the payload. Required, so the caller cannot leave a holder with only their base level.
   */
  createForPayload(payload: Omit<TokenPayload, 'permissions'>, permissionSetRules: PermissionSetRule[]): AppAbility {
    this.loggingService.verbose({
      message: 'Creating Ability From Payload',
      payload
    });
    const ability = new AbilityBuilder<AppAbility>(createPrismaAbility);
    const groupIds = payload.groups.map((group) => group.id);

    // A user owing a password reset holds one rule: read themselves, which is what `updateSelfById`
    // is gated on. Every route naming another subject is then refused by the ordinary `@RouteAccess`
    // check, with no allowlist to keep up to date, whether the request comes from the web client or
    // from curl. Routes gated on `read User` still pass that check, because it tests the subject
    // type and a conditional rule satisfies it -- those stay confined by `accessibleQuery`, which
    // applies the condition and so reduces every such query to the user themselves.
    if (payload.mustResetPassword) {
      ability.can('read', 'User', { id: payload.id });
      return ability.build({ detectSubjectType: detectAppSubject });
    }

    switch (payload.basePermissionLevel) {
      case 'ADMIN':
        ability.can('manage', 'all');
        break;
      case 'GROUP_MANAGER':
        ability.can('manage', 'Assignment', { groupId: { in: groupIds } });
        ability.can('manage', 'Group', { id: { in: groupIds } });
        ability.can('read', 'Instrument');
        // Group managers may assemble series instruments on the fly and delete ones they created. A
        // series is a bundle of other instruments, not a shared platform asset. Read and delete access
        // to generated series is restricted to the group that owns it; shared and legacy instruments
        // have no owning group and remain readable by all groups.
        ability.can('create', 'Instrument');
        ability.can('delete', 'Instrument', { seriesGroupId: { in: groupIds } });
        ability.can('read', 'InstrumentRepo', { groupIds: { hasSome: groupIds } });
        ability.can('create', 'InstrumentRecord');
        ability.can('create', 'InstrumentRecordFile', { groupId: { in: groupIds } });
        ability.can('read', 'InstrumentRecord', { groupId: { in: groupIds } });
        ability.can('read', 'InstrumentRecordFile', { groupId: { in: groupIds } });
        ability.can('create', 'Session');
        ability.can('read', 'Session', { groupId: { in: groupIds } });
        ability.can('create', 'Subject');
        ability.can('read', 'Subject', { groupIds: { hasSome: groupIds } });
        ability.can('read', 'User', { groupIds: { hasSome: groupIds } });
        break;
      case 'STANDARD':
        ability.can('read', 'Group', { id: { in: groupIds } });
        ability.can('read', 'Instrument');
        ability.can('create', 'InstrumentRecord');
        ability.can('create', 'InstrumentRecordFile', { groupId: { in: groupIds } });
        ability.can('read', 'Session', { groupId: { in: groupIds } });
        ability.can('create', 'Session');
        ability.can('create', 'Subject');
        ability.can('read', 'Subject', { groupIds: { hasSome: groupIds } });
        ability.can('read', 'User', { id: payload.id });
        break;
    }
    permissionSetRules.forEach((rule) => {
      grantWithin(ability, rule, rule.scope === 'ALL_GROUPS' ? null : groupIds, 'permission set rule');
    });
    payload.additionalPermissions?.forEach((permission) => {
      grantWithin(ability, permission, permission.groupId === null ? null : [permission.groupId], 'permission');
    });
    return ability.build({
      detectSubjectType: detectAppSubject
    });
  }

  createForPermissions(permissions: Permission[]): AppAbility {
    this.loggingService.verbose({
      message: 'Creating Ability From Permissions',
      permissions
    });
    return createAppAbility(permissions);
  }
}
