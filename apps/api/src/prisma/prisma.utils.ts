import { createMockObject } from '@douglasneuroinformatics/nestjs/testing';
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
    useValue: createMockObject({})
  };
}
