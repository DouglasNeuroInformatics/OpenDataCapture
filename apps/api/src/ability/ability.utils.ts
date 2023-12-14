import { accessibleBy } from '@casl/prisma';
import type { AppAction } from '@open-data-capture/common';

import type { AppAbility } from '@/core/types';
import type { ModelEntityName } from '@/prisma/prisma.types';

export function accessibleQuery<T extends ModelEntityName>(
  ability: AppAbility | undefined,
  action: AppAction,
  modelName: T
) {
  if (!ability) {
    return {};
  }
  return accessibleBy(ability, action)[modelName];
}
