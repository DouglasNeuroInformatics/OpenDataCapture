import { AbilityBuilder, createMongoAbility } from '@casl/ability';
import { Injectable, Logger } from '@nestjs/common';
import type { AppAbility } from '@open-data-capture/common/core';
import type { User } from '@open-data-capture/common/user';

@Injectable()
export class AbilityFactory {
  private readonly logger = new Logger(AbilityFactory.name);

  createForUser(user: User): AppAbility {
    this.logger.verbose('Creating ability for user: ' + user.username);
    const ability = new AbilityBuilder<AppAbility>(createMongoAbility);
    switch (user.basePermissionLevel) {
      case 'ADMIN':
        ability.can('manage', 'all');
        break;
      case 'GROUP_MANAGER':
        ability.can('manage', 'Assignment');
        ability.can('read', 'Group', { _id: { $in: user.groups.map((group) => group.id) } });
        ability.can('read', 'Instrument');
        ability.can('create', 'InstrumentRecord');
        ability.can('read', 'InstrumentRecord', { group: { $in: user.groups } });
        ability.can('create', 'Subject');
        ability.can('read', 'Subject', { groups: { $in: user.groups } });
        ability.can('read', 'Summary');
        ability.can('read', 'User', { groups: { $in: user.groups } });
        ability.can('read', 'Visit');
        ability.can('create', 'Visit');
        break;
      case 'STANDARD':
        ability.can('read', 'Group', { _id: { $in: user.groups.map((group) => group.id) } });
        ability.can('read', 'Instrument');
        ability.can('create', 'InstrumentRecord');
        ability.can('create', 'Subject');
        ability.can('read', 'Subject', { groups: { $in: user.groups } });
        ability.can('read', 'Visit');
        ability.can('create', 'Visit');
    }
    return ability.build();
  }
}
