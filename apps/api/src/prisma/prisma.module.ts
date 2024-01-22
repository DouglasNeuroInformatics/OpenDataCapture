import { type DynamicModule, Module } from '@nestjs/common';

import { ConfigurationService } from '@/configuration/configuration.service';

import { type ExtendedPrismaClient, PRISMA_CLIENT_TOKEN, PrismaFactory } from './prisma.factory';
import { PrismaService } from './prisma.service';
import { getModelReferenceName, getModelToken } from './prisma.utils';

import type { ModelEntityName } from './prisma.types';

@Module({})
export class PrismaModule {
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
            return client[getModelReferenceName(modelName)];
          }
        }
      ]
    };
  }
  static forRoot(): DynamicModule {
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
            const datasourceUrl = `${mongoUri}/data-capture-${dbName}`;
            return PrismaFactory.createClient({ datasourceUrl });
          }
        },
        PrismaService
      ]
    };
  }
}
