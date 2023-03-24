import { Injectable, Logger } from '@nestjs/common';

import { AbilityBuilder, createMongoAbility } from '@casl/ability';

import { AppAbility } from './permissions.types';

import { User } from '@/users/entities/user.entity';

@Injectable()
export class PermissionsFactory {
  private readonly logger = new Logger(PermissionsFactory.name);

  createForUser(user: User): AppAbility {
    this.logger.verbose('Creating permissions for user: ' + user.username);
    const ability = new AbilityBuilder<AppAbility>(createMongoAbility);
    switch (user.basePermissionLevel) {
      case 'admin':
        ability.can('manage', 'all');
        break;
      case 'group-manager':
        ability.can('manage', 'Group', { name: { $in: user.groups.map((group) => group.name) } });
        break;
      case 'standard':
        ability.can('read', 'all');
        break;
    }
    return ability.build();
  }
}
