import { AbilityBuilder } from '@casl/ability';
import { createPrismaAbility } from '@casl/prisma';
import { Injectable, Logger } from '@nestjs/common';
import { Prisma, type UserModel } from '@open-data-capture/database/core';

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
        ability.can('read', 'Group', { id: { in: user.groupIds } });
        ability.can('read', 'Instrument');
        ability.can('create', 'InstrumentRecord');
        ability.can('read', 'InstrumentRecord', { groupId: { in: user.groupIds } });
        ability.can('create', 'Subject');
        ability.can('read', 'Subject', { groupIds: { hasSome: user.groupIds } });
        ability.can('read', 'Summary');
        ability.can('read', 'User', { groupIds: { hasSome: user.groupIds } });
        ability.can('create', 'Visit');
        break;
      case 'STANDARD':
        ability.can('read', 'Group', { id: { in: user.groupIds } });
        ability.can('read', 'Instrument');
        ability.can('create', 'InstrumentRecord');
        ability.can('create', 'Subject');
        ability.can('read', 'Subject', { groupIds: { hasSome: user.groupIds } });
        ability.can('read', 'Visit');
        ability.can('create', 'Visit');
    }
    return ability.build({
      detectSubjectType: (object: Record<string, any>) => object.__model__
    });
  }
}
