import { accessibleBy } from '@casl/prisma';
import type { AppAction } from '@opendatacapture/schemas/core';

import type { AppAbility } from '@/core/types';
import type { ModelEntityName } from '@/prisma/prisma.types';
// import { getModelName } from '@/prisma/prisma.utils';

export function accessibleQuery<T extends ModelEntityName>(
  ability: AppAbility | undefined,
  action: AppAction,
  entityName: T
) {
  if (!ability) {
    return {};
  }

  // @ts-expect-error - under investigation
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return accessibleBy(ability, action)[entityName];
  // what should work accessibleBy(ability, action)[getModelName(entityName)]
}
