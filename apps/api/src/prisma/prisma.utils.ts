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
