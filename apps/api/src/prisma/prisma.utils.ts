import type { ModelSimplifiedName } from './prisma.types';

export function getModelReferenceName<T extends ModelSimplifiedName>(modelName: T) {
  return (modelName.charAt(0).toLowerCase() + modelName.slice(1) + 'Model') as `${Uncapitalize<T>}Model`;
}

export function getModelToken<T extends ModelSimplifiedName>(modelName: T) {
  return modelName + 'PrismaModel';
}
