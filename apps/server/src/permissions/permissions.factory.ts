import { Injectable, Logger } from '@nestjs/common';

import { AbilityBuilder, PureAbility } from '@casl/ability';

import { AppAbility, type Permissions } from './permissions.types';

import { CreateUserDto } from '@/users/dto/create-user.dto';
import { UserRole } from '@/users/enums/user-role.enum';

@Injectable()
export class PermissionsFactory {
  private readonly logger = new Logger(PermissionsFactory.name);

  createForUser(user: Pick<CreateUserDto, 'username' | 'role'>): Permissions {
    this.logger.verbose(`Creating permissions for user '${user.username}' with role '${user.role!}'`);
    const ability = new AbilityBuilder<AppAbility>(PureAbility);
    switch (user.role) {
      case UserRole.Admin:
        ability.can('manage', 'all');
        break;
      case UserRole.GroupManager:
        ability.can('manage', 'all');
        break;
      case UserRole.Standard:
        ability.can('read', 'all');
        break;
    }
    const x = ability.build();
    return x.rules;
  }
}
