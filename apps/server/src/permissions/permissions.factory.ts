import { Injectable, Logger } from '@nestjs/common';

import { AbilityBuilder, PureAbility } from '@casl/ability';

import { AppAbility } from './permissions.types';

import { CreateUserDto } from '@/users/dto/create-user.dto';
import { UserRole } from '@/users/enums/user-role.enum';

@Injectable()
export class PermissionsFactory {
  private readonly logger = new Logger(PermissionsFactory.name);

  createForUser(user: Pick<CreateUserDto, 'username' | 'role'>): AppAbility {
    this.logger.verbose(`Creating permissions for user '${user.username}' with role '${user.role!}'`);
    const permissions = new AbilityBuilder<AppAbility>(PureAbility);
    switch (user.role) {
      case UserRole.Admin:
        permissions.can('manage', 'all');
        break;
      case UserRole.GroupManager:
        permissions.can('manage', 'all');
        break;
      case UserRole.Standard:
        permissions.can('read', 'all');
        break;
    }
    return permissions.build();
  }
}
