import { Injectable } from '@nestjs/common';

import { AbilityBuilder, createMongoAbility } from '@casl/ability';

import { User } from '@/users/entities/user.entity';

@Injectable()
export class PermissionsFactory {
  createForUser(user: User): any {
    const permissions = new AbilityBuilder(createMongoAbility);
    permissions.can('manage', 'all');
    return permissions.build();
  }
}
