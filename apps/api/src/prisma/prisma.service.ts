import { Inject, Injectable, type OnModuleInit } from '@nestjs/common';

import { EXTENDED_PRISMA_CLIENT_TOKEN, type ExtendedPrismaClient } from './prisma.client';

@Injectable()
export class PrismaService implements OnModuleInit {
  public dbName = 'Unknown';

  constructor(@Inject(EXTENDED_PRISMA_CLIENT_TOKEN) public readonly client: ExtendedPrismaClient) {}

  async dropDatabase() {
    return this.client.$runCommandRaw({
      dropDatabase: 1
    });
  }

  async listCollections() {
    return this.client.$runCommandRaw({
      listCollections: 1
    });
  }

  async onModuleInit() {
    await this.client.$connect();
  }
}
