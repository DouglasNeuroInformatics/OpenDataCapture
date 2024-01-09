import { type DynamicModule, Module } from '@nestjs/common';
import { type Instrument, evaluateInstrument } from '@open-data-capture/common/instrument';
import { Prisma, PrismaClient } from '@open-data-capture/database/core';

import { PRISMA_CLIENT_TOKEN } from './prisma.constants';
import { getModelReferenceName, getModelToken } from './prisma.utils';

import type { ModelEntityName } from './prisma.types';

export type AppPrismaClient = ReturnType<typeof PrismaModule.createClient>;

@Module({})
export class PrismaModule {
  static createClient() {
    return new PrismaClient().$extends({
      model: {
        $allModels: {
          get __model__() {
            const context = Prisma.getExtensionContext(this);
            return context.$name;
          },
          async exists<T>(this: T, where: Prisma.Args<T, 'findFirst'>['where']): Promise<boolean> {
            const context = Prisma.getExtensionContext(this) as unknown as {
              findFirst: (...args: any[]) => Promise<unknown>;
            };
            const result = await context.findFirst({ where });
            return result !== null;
          }
        }
      },
      result: {
        instrumentModel: {
          toInstance: {
            compute({ bundle }) {
              return <T extends Instrument = Instrument>() => evaluateInstrument<T>(bundle);
            },
            needs: { bundle: true }
          }
        }
      }
    });
  }
  static forFeature<T extends ModelEntityName>(modelName: T): DynamicModule {
    const modelToken = getModelToken(modelName);
    return {
      exports: [modelToken],
      module: PrismaModule,
      providers: [
        {
          inject: [PRISMA_CLIENT_TOKEN],
          provide: modelToken,
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
