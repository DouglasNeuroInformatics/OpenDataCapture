import { Injectable } from '@nestjs/common';

import { AbilityBuilder, PureAbility } from '@casl/ability';

import { AppAbility } from './permissions.types';

import { User } from '@/users/entities/user.entity';
import { UserKind } from '@/users/enums/user-kind.enum';

@Injectable()
export class PermissionsFactory {
  createForUser(user: User): AppAbility {
    const permissions = new AbilityBuilder<AppAbility>(PureAbility);
    switch (user.kind) {
      case UserKind.Admin:
        permissions.can('manage', 'all');
        break;
      case UserKind.Standard:
        permissions.can('read', 'all');
        break;
    }
    return permissions.build();
  }
}
