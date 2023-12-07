import { type DynamicModule, Module } from '@nestjs/common';
import { Prisma, PrismaClient } from '@open-data-capture/database';

import { PRISMA_CLIENT_TOKEN } from './prisma.constants';
import { getModelReferenceName, getModelToken } from './prisma.utils';

import type { ModelSimplifiedName } from './prisma.types';

export type AppPrismaClient = ReturnType<typeof PrismaModule.createClient>;

@Module({})
export class PrismaModule {
  static createClient() {
    return new PrismaClient().$extends({
      model: {
        $allModels: {
          async exists<T>(this: T, where: Prisma.Args<T, 'findFirst'>['where']): Promise<boolean> {
            // Get the current model at runtime
            const context = Prisma.getExtensionContext(this);
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
            const result = await (context as any).findFirst({ where });
            return result !== null;
          }
        },
        groupModel: {
          __model__: 'Group'
        }
      }
    });
  }
  static forFeature<T extends ModelSimplifiedName>(modelName: T): DynamicModule {
    return {
      exports: [modelName],
      module: PrismaModule,
      providers: [
        {
          inject: [PRISMA_CLIENT_TOKEN],
          provide: getModelToken(modelName),
          useFactory: (client: AppPrismaClient) => {
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
}
