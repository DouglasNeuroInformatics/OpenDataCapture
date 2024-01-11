import { type DynamicModule, Module } from '@nestjs/common';

import { EXTENDED_PRISMA_CLIENT_TOKEN, type ExtendedPrismaClient, createExtendedPrismaClient } from './prisma.client';
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
          inject: [EXTENDED_PRISMA_CLIENT_TOKEN],
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
      exports: [EXTENDED_PRISMA_CLIENT_TOKEN, PrismaService],
      global: true,
      module: PrismaModule,
      providers: [
        {
          provide: EXTENDED_PRISMA_CLIENT_TOKEN,
          useValue: createExtendedPrismaClient()
        },
        PrismaService
      ]
    };
  }
}
