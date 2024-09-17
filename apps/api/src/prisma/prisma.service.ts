import {
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
  type OnApplicationShutdown,
  type OnModuleInit
} from '@nestjs/common';

import { ConfigurationService } from '@/configuration/configuration.service';

import { type ExtendedPrismaClient, PRISMA_CLIENT_TOKEN } from './prisma.factory';

@Injectable()
export class PrismaService implements OnModuleInit, OnApplicationShutdown {
  private readonly logger = new Logger(PrismaService.name);

  constructor(
    @Inject(PRISMA_CLIENT_TOKEN) public readonly client: ExtendedPrismaClient,
    private readonly configurationService: ConfigurationService
  ) {}

  async dropDatabase() {
    this.logger.debug('Attempting to drop database...');
    const result = await this.client.$runCommandRaw({
      dropDatabase: 1
    });
    if (result.ok !== 1) {
      throw new InternalServerErrorException('Failed to drop database: raw mongodb command returned unexpected value', {
        cause: result
      });
    }
    this.logger.debug('Successfully dropped database');
  }

  async getDbName() {
    this.logger.debug('Attempting to get database name...');
    const dbName = await this.client.$runCommandRaw({ dbStats: 1 }).then((stats) => stats.db as string);
    this.logger.debug(`Resolved database name: ${dbName}`);
    return dbName;
  }

  async onApplicationShutdown() {
    await this.client.$disconnect();
    if (this.configurationService.get('NODE_ENV') === 'test') {
      await this.dropDatabase();
    }
  }

  async onModuleInit() {
    this.logger.debug('Attempting to connect to database...');
    await this.client.$connect();
    this.logger.debug('Successfully connected to database');
  }
}
