import { Injectable, Logger } from '@nestjs/common';

import { AbilityBuilder, createMongoAbility } from '@casl/ability';
import { AppAbility, User } from '@open-data-capture/types';

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
        ability.can('read', 'Group', { _id: { $in: user.groups } });
        ability.can('read', 'Instrument');
        ability.can('create', 'InstrumentRecord');
        ability.can('read', 'InstrumentRecord', { group: { $in: user.groups } });
        ability.can('create', 'Subject');
        ability.can('read', 'Subject', { groups: { $in: user.groups } });
        ability.can('read', 'User', { groups: { $in: user.groups } });
        break;
      case 'STANDARD':
        ability.can('read', 'Group', { _id: { $in: user.groups } });
        ability.can('read', 'Instrument');
        ability.can('create', 'InstrumentRecord');
        ability.can('create', 'Subject');
        ability.can('read', 'Subject', { groups: { $in: user.groups } });
    }
    return ability.build();
  }
}
