import { type DynamicModule, Module } from '@nestjs/common';
import { PrismaClient } from '@open-data-capture/database';

import { PRISMA_CLIENT_TOKEN } from './prisma.constants';

@Module({})
export class PrismaModule {
  static forRoot(): DynamicModule {
    return {
      exports: [PRISMA_CLIENT_TOKEN],
      global: true,
      module: PrismaModule,
      providers: [
        {
          provide: PRISMA_CLIENT_TOKEN,
          useValue: new PrismaClient()
        }
      ]
    };
  }
}
