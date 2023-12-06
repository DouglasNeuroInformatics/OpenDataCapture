import { type DynamicModule, Module } from '@nestjs/common';
import { PrismaClient } from '@open-data-capture/database';

import { PRISMA_CLIENT_TOKEN } from './prisma.constants';
import { getModelReferenceName } from './prisma.utils';

import type { ModelSimplifiedName } from './prisma.types';

@Module({})
export class PrismaModule {
  static forFeature<T extends ModelSimplifiedName>(modelName: T): DynamicModule {
    return {
      exports: [modelName],
      module: PrismaModule,
      providers: [
        {
          inject: [PRISMA_CLIENT_TOKEN],
          provide: modelName,
          useFactory: (client: PrismaClient) => {
            return client[getModelReferenceName(modelName)];
          }
        }
      ]
    };
  }
  static forRoot(): DynamicModule {
    return {
      exports: [PRISMA_CLIENT_TOKEN],
      global: true,
      module: PrismaModule,
      providers: [
        {
          provide: PRISMA_CLIENT_TOKEN,
          useValue: this.createClient()
        }
      ]
    };
  }
  private static createClient() {
    return new PrismaClient().$extends({
      model: {
        groupModel: {
          __model__: 'Group'
        }
      }
    });
  }
}
