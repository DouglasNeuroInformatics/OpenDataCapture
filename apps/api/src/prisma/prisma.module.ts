import { type DynamicModule, Logger, Module } from '@nestjs/common';

import { ConfigurationService } from '@/configuration/configuration.service';

import { type ExtendedPrismaClient, PRISMA_CLIENT_TOKEN, PrismaFactory } from './prisma.factory';
import { PrismaService } from './prisma.service';
import { getModelReferenceName, getModelToken } from './prisma.utils';

import type { ModelEntityName } from './prisma.types';

@Module({})
export class PrismaModule {
  private static logger = new Logger(PrismaModule.name);

  static forFeature<T extends ModelEntityName>(modelName: T): DynamicModule {
    const modelToken = getModelToken(modelName);
    return {
      exports: [modelToken],
      module: PrismaModule,
      providers: [
        {
          inject: [PRISMA_CLIENT_TOKEN],
          provide: modelToken,
          useFactory: (client: ExtendedPrismaClient) => {
            this.logger.debug(`Injecting model for resolved token: '${modelToken}'`);
            return client[getModelReferenceName(modelName)];
          }
        }
      ]
    };
  }
  static forRoot(): DynamicModule {
    this.logger.debug('Applying root configuration...');
    return {
      exports: [PRISMA_CLIENT_TOKEN, PrismaService],
      global: true,
      module: PrismaModule,
      providers: [
        {
          inject: [ConfigurationService],
          provide: PRISMA_CLIENT_TOKEN,
          useFactory: (configurationService: ConfigurationService) => {
            const mongoUri = configurationService.get('MONGO_URI');
            const dbName = configurationService.get('NODE_ENV');
            const url = new URL(`${mongoUri}/data-capture-${dbName}`);
            // if (dbName === 'production') {
            //   url.searchParams.append('replicaSet', 'rs0');
            //   url.searchParams.append('retryWrites', 'true');
            //   url.searchParams.append('w', 'majority');
            //   url.searchParams.append('directConnection', 'true');
            // }
            this.logger.debug(`Attempting to create client with data source: '${url.href}'`);
            return PrismaFactory.createClient({ datasourceUrl: url.href });
          }
        },
        PrismaService
      ]
    };
  }
}
