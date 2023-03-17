import { Injectable, Logger } from '@nestjs/common';

import { AbilityBuilder, createMongoAbility } from '@casl/ability';

import { DefaultPermissionLevel } from './permissions.types';
import { AppAbility, type Permissions } from './permissions.types';

import { Group } from '@/groups/schemas/group.schema';

@Injectable()
export class PermissionsFactory {
  private readonly logger = new Logger(PermissionsFactory.name);

  createDefaultPermissions<T extends DefaultPermissionLevel | undefined>(
    level?: T,
    options?: T extends 'admin' ? never : { groups: Group[] } | undefined
  ): Permissions {
    this.logger.verbose('Creating default permissions for level: ' + level);
    const ability = new AbilityBuilder<AppAbility>(createMongoAbility);
    switch (level) {
      case 'admin':
        ability.can('manage', 'all');
        break;
      case 'group-manager':
        ability.can('manage', 'Group', { name: { $in: options?.groups.map((group) => group.name) } });
        break;
      case 'standard':
        ability.can('read', 'all');
        break;
    }
    return ability.build().rules;
  }
}
