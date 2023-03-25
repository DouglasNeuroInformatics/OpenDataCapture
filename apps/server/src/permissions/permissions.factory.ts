import { Injectable, Logger } from '@nestjs/common';

import { AbilityBuilder, createMongoAbility } from '@casl/ability';
import { BasePermissionLevel } from '@ddcp/common';
import { AppAbility } from '@ddcp/common/auth';

import { UserEntity } from '@/users/entities/user.entity';

@Injectable()
export class PermissionsFactory {
  private readonly logger = new Logger(PermissionsFactory.name);

  createForUser(user: UserEntity): AppAbility {
    user.groups.map((group) => group.name);

    this.logger.verbose('Creating permissions for user: ' + user.username);
    const ability = new AbilityBuilder<AppAbility>(createMongoAbility);
    switch (user.basePermissionLevel) {
      case BasePermissionLevel.Admin:
        ability.can('manage', 'all');
        break;
      case BasePermissionLevel.GroupManager:
        ability.can('manage', 'Group', { name: { $in: user.groups.map((group) => group.name) } });
        break;
      case BasePermissionLevel.Standard:
        ability.can('read', 'all');
        break;
    }
    return ability.build();
  }
}
