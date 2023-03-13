import { Injectable, Logger } from '@nestjs/common';

import { AbilityBuilder, PureAbility } from '@casl/ability';

import { AppAbility } from './permissions.types';

import { CreateUserDto } from '@/users/dto/create-user.dto';
import { UserKind } from '@/users/enums/user-kind.enum';

@Injectable()
export class PermissionsFactory {
  private readonly logger = new Logger(PermissionsFactory.name);

  createForUser(user: Pick<CreateUserDto, 'username' | 'kind'>): AppAbility {
    this.logger.verbose(`Creating permissions for user '${user.username}' with kind '${user.kind!}'`);
    const permissions = new AbilityBuilder<AppAbility>(PureAbility);
    switch (user.kind) {
      case UserKind.Admin:
        permissions.can('manage', 'all');
        break;
      case UserKind.GroupManager:
        permissions.can('manage', 'all');
        break;
      case UserKind.Standard:
        permissions.can('read', 'all');
        break;
    }
    return permissions.build();
  }
}
