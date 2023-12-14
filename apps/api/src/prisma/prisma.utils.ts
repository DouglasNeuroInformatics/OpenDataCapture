import { jest } from 'bun:test';

import type { Provider } from '@nestjs/common';

import type { ModelEntityName, ModelName } from './prisma.types';

export function getModelReferenceName<T extends ModelEntityName>(entityName: T) {
  return (entityName.charAt(0).toLowerCase() + entityName.slice(1) + 'Model') as `${Uncapitalize<T>}Model`;
}

export function getModelName<T extends ModelEntityName>(entityName: T) {
  return entityName + 'Model' as ModelName<T>
}

export function getModelToken<T extends ModelEntityName>(entityName: T) {
  return entityName + 'PrismaModel';
}

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
