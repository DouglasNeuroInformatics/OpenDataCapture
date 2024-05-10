import { AbilityBuilder, detectSubjectType } from '@casl/ability';
import { createPrismaAbility } from '@casl/prisma';
import { Injectable, Logger } from '@nestjs/common';
import { Prisma, type UserModel } from '@opendatacapture/prisma-client/api';
import type { AppSubjectName } from '@opendatacapture/schemas/core';

import type { AppAbility } from '@/core/types';

Prisma;
@Injectable()
export class AbilityFactory {
  private readonly logger = new Logger(AbilityFactory.name);

  createForUser(user: UserModel): AppAbility {
    this.logger.verbose('Creating ability for user: ' + user.username);
    const ability = new AbilityBuilder<AppAbility>(createPrismaAbility);
    switch (user.basePermissionLevel) {
      case 'ADMIN':
        ability.can('manage', 'all');
        break;
      case 'GROUP_MANAGER':
        ability.can('manage', 'Assignment');
        ability.can('manage', 'Group', { id: { in: user.groupIds } });
        ability.can('read', 'Instrument');
        ability.can('create', 'InstrumentRecord');
        ability.can('read', 'InstrumentRecord', { groupId: { in: user.groupIds } });
        ability.can('create', 'Session');
        ability.can('read', 'Session', { groupId: { in: user.groupIds } });
        ability.can('create', 'Subject');
        ability.can('read', 'Subject', { groupIds: { hasSome: user.groupIds } });
        ability.can('read', 'Summary');
        ability.can('read', 'User', { groupIds: { hasSome: user.groupIds } });

        break;
      case 'STANDARD':
        ability.can('read', 'Group', { id: { in: user.groupIds } });
        ability.can('read', 'Instrument');
        ability.can('create', 'InstrumentRecord');
        ability.can('read', 'Session');
        ability.can('create', 'Session');
        ability.can('create', 'Subject');
        ability.can('read', 'Subject', { groupIds: { hasSome: user.groupIds } });
    }
    return ability.build({
      detectSubjectType: (object: { [key: string]: any }) => {
        if (object.__model__) {
          return object.__model__ as AppSubjectName;
        }
        return detectSubjectType(object) as AppSubjectName;
      }
    });
  }
}
