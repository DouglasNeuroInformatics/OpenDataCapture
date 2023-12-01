import { Inject } from '@nestjs/common';
import { Prisma } from '@open-data-capture/database';

import { PRISMA_CLIENT_TOKEN } from './prisma.constants';

export const InjectPrismaClient = () => {
  return Inject(PRISMA_CLIENT_TOKEN);
};

export const InjectModel = <T extends Prisma.ModelName>(modelName: T): ReturnType<typeof Inject> => {
  return Inject(modelName);
};
