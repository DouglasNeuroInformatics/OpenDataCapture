import { AbilityBuilder } from '@casl/ability';
import { createPrismaAbility } from '@casl/prisma';
import { LoggingService } from '@douglasneuroinformatics/libnest';
import { Injectable } from '@nestjs/common';
import type { TokenPayload } from '@opendatacapture/schemas/auth';

import { createAppAbility, detectAppSubject } from './ability.utils';

import type { AppAbility, Permission } from './auth.types';

@Injectable()
export class AbilityFactory {
  constructor(private readonly loggingService: LoggingService) {}

  createForPayload(payload: Omit<TokenPayload, 'permissions'>): AppAbility {
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
    payload.additionalPermissions?.forEach(({ action, subject }) => {
      ability.can(action, subject);
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
