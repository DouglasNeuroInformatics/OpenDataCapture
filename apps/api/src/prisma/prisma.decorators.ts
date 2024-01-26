import { Inject } from '@nestjs/common';

import { getModelToken } from './prisma.utils';

import type { ModelEntityName } from './prisma.types';

export const InjectModel = <T extends ModelEntityName>(modelName: T): ReturnType<typeof Inject> => {
  return Inject(getModelToken(modelName));
};
