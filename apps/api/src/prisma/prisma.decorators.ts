import { Inject } from '@nestjs/common';

import { PRISMA_CLIENT_TOKEN } from './prisma.constants';
import { getModelToken } from './prisma.utils';

import type { ModelSimplifiedName } from './prisma.types';

export const InjectPrismaClient = () => {
  return Inject(PRISMA_CLIENT_TOKEN);
};

export const InjectModel = <T extends ModelSimplifiedName>(modelName: T): ReturnType<typeof Inject> => {
  return Inject(getModelToken(modelName));
};
