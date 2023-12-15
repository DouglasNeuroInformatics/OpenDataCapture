import { jest } from 'bun:test';

import type { Provider } from '@nestjs/common';

import type { ModelEntityName } from '@/prisma/prisma.types';
import { getModelToken } from '@/prisma/prisma.utils';

export function createMockModelProvider<T extends ModelEntityName>(entityName: T): Provider {
  return {
    provide: getModelToken(entityName),
    useValue: {
      aggregate: jest.fn(),
      aggregateRaw: jest.fn(),
      count: jest.fn(),
      create: jest.fn(),
      createMany: jest.fn(),
      delete: jest.fn(),
      deleteMany: jest.fn(),
      exists: jest.fn(),
      fields: jest.fn(),
      findFirst: jest.fn(),
      findFirstOrThrow: jest.fn(),
      findMany: jest.fn(),
      findRaw: jest.fn(),
      findUnique: jest.fn(),
      findUniqueOrThrow: jest.fn(),
      groupBy: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
      upsert: jest.fn()
    }
  };
}
