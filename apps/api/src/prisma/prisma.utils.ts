import type { Prisma } from '@open-data-capture/database';

export function getModelReferenceName<T extends Prisma.ModelName>(modelName: T) {
  return (modelName.charAt(0).toLowerCase() + modelName.slice(1)) as Uncapitalize<T>;
}
