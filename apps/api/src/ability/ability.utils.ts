import { accessibleBy } from '@casl/prisma';
import type { AppAction } from '@open-data-capture/common/core';

import type { AppAbility } from '@/core/types';
import type { ModelEntityName } from '@/prisma/prisma.types';
import { getModelName } from '@/prisma/prisma.utils';

export function accessibleQuery<T extends ModelEntityName>(
  ability: AppAbility | undefined,
  action: AppAction,
  entityName: T
) {
  if (!ability) {
    return {};
  }
  return accessibleBy(ability, action)[getModelName(entityName)];
}
