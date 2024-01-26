import { Inject, Injectable, InternalServerErrorException, Logger, type OnModuleInit } from '@nestjs/common';

import { type ExtendedPrismaClient, PRISMA_CLIENT_TOKEN } from './prisma.factory';

@Injectable()
export class PrismaService implements OnModuleInit {
  private readonly logger = new Logger(PrismaService.name);

  constructor(@Inject(PRISMA_CLIENT_TOKEN) public readonly client: ExtendedPrismaClient) {}

  async dropDatabase() {
    this.logger.debug('Attempting to drop database...');
    const result = await this.client.$runCommandRaw<{ ok: number }>({
      dropDatabase: 1
    });
    if (result.ok !== 1) {
      throw new InternalServerErrorException('Failed to drop database: raw mongodb command returned unexpected value', {
        cause: result
      })
    }
    this.logger.debug('Successfully dropped database');
  }

  async getDbName() {
    this.logger.debug('Attempting to get database name...');
    const dbName = await this.client.$runCommandRaw<{ db: string }>({ dbStats: 1 }).then((stats) => stats.db);
    this.logger.debug(`Resolved database name: ${dbName}`);
    return dbName;
  }

  async onModuleInit() {
    this.logger.debug('Attempting to connect to database...');
    await this.client.$connect();
    this.logger.debug('Successfully connected to database');
  }
}
