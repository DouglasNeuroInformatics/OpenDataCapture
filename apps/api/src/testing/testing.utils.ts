import type { Provider } from '@nestjs/common';
import { vi } from 'vitest';

import type { ModelEntityName } from '@/prisma/prisma.types';
import { getModelToken } from '@/prisma/prisma.utils';

export function createMockModelProvider<T extends ModelEntityName>(entityName: T): Provider {
  return {
    provide: getModelToken(entityName),
    useValue: {
      aggregate: vi.fn(),
      aggregateRaw: vi.fn(),
      count: vi.fn(),
      create: vi.fn(),
      createMany: vi.fn(),
      delete: vi.fn(),
      deleteMany: vi.fn(),
      exists: vi.fn(),
      fields: vi.fn(),
      findFirst: vi.fn(),
      findFirstOrThrow: vi.fn(),
      findMany: vi.fn(),
      findRaw: vi.fn(),
      findUnique: vi.fn(),
      findUniqueOrThrow: vi.fn(),
      groupBy: vi.fn(),
      update: vi.fn(),
      updateMany: vi.fn(),
      upsert: vi.fn()
    }
  };
}
