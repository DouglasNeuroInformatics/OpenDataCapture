import { Inject } from '@nestjs/common';

import { PRISMA_CLIENT_TOKEN } from './prisma.constants';

export const InjectPrismaClient = () => {
  return Inject(PRISMA_CLIENT_TOKEN);
};
