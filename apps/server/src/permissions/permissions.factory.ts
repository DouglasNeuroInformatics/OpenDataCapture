import { Injectable, Logger } from '@nestjs/common';

import { AbilityBuilder, PureAbility } from '@casl/ability';

import { DefaultPermissionLevel } from './permissions.types';
import { AppAbility, type Permissions } from './permissions.types';

import { Group } from '@/groups/schemas/group.schema';

@Injectable()
export class PermissionsFactory {
  private readonly logger = new Logger(PermissionsFactory.name);

  createDefaultPermissions(
    level?: DefaultPermissionLevel,
    options?: {
      groups?: Group[];
    }
  ): Permissions {
    this.logger.verbose('Creating default permissions for level: ' + level);
    const ability = new AbilityBuilder<AppAbility>(PureAbility);
    switch (level) {
      case 'admin':
        ability.can('manage', 'all');
        break;
    }
    return ability.build().rules;
  }
}
