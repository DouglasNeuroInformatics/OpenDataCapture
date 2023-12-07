import { accessibleBy } from '@casl/prisma';
import type { AppAction } from '@open-data-capture/common';
import type { Prisma } from '@open-data-capture/database';

import type { AppAbility } from '@/core/types';

export function accessibleQuery<T extends Prisma.ModelName>(ability: AppAbility | undefined, action: AppAction, modelName: T) {
  if (!ability) {
    return {};
  }
  return accessibleBy(ability, action)[modelName];
}
