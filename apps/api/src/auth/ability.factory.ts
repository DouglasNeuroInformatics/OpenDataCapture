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
    switch (payload.basePermissionLevel) {
      case 'ADMIN':
        ability.can('manage', 'all');
        break;
      case 'GROUP_MANAGER':
        ability.can('manage', 'Assignment', { groupId: { in: groupIds } });
        ability.can('manage', 'Group', { id: { in: groupIds } });
        ability.can('read', 'Instrument');
        ability.can('create', 'InstrumentRecord');
        ability.can('read', 'InstrumentRecord', { groupId: { in: groupIds } });
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
        ability.can('read', 'Session', { groupId: { in: groupIds } });
        ability.can('create', 'Session');
        ability.can('create', 'Subject');
        ability.can('read', 'Subject', { groupIds: { hasSome: groupIds } });
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
