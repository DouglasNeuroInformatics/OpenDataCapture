import type { Prisma, PrismaClient } from '@open-data-capture/database';
import type { Replace } from 'type-fest';

export type ModelReferenceName= Uncapitalize<Prisma.ModelName>;

export type ModelSimplifiedName = Replace<Prisma.ModelName, 'Model', ''>;

export type Model<T extends ModelSimplifiedName> = PrismaClient[`${Uncapitalize<T>}Model`];
