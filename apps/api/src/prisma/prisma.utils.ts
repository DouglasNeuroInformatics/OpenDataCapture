import { jest } from 'bun:test';

import type { Provider } from '@nestjs/common';

import type { ModelSimplifiedName } from './prisma.types';

export function getModelReferenceName<T extends ModelSimplifiedName>(modelName: T) {
  return (modelName.charAt(0).toLowerCase() + modelName.slice(1) + 'Model') as `${Uncapitalize<T>}Model`;
}

export function getModelToken<T extends ModelSimplifiedName>(modelName: T) {
  return modelName + 'PrismaModel';
}

export function createMockModelProvider<T extends ModelSimplifiedName>(modelName: T): Provider {
  return {
    provide: getModelToken(modelName),
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
