import { Inject, Injectable, type OnModuleInit } from '@nestjs/common';

import { type ExtendedPrismaClient, PRISMA_CLIENT_TOKEN } from './prisma.factory';

@Injectable()
export class PrismaService implements OnModuleInit {
  public dbName = 'Unknown';

  constructor(@Inject(PRISMA_CLIENT_TOKEN) public readonly client: ExtendedPrismaClient) {}

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
