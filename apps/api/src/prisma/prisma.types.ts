import type { Prisma } from '@open-data-capture/database';
import type { Replace } from 'type-fest';

import type { AppPrismaClient } from './prisma.module';

export type ModelReferenceName= Uncapitalize<Prisma.ModelName>;

export type ModelSimplifiedName = Replace<Prisma.ModelName, 'Model', ''>;

export type Model<T extends ModelSimplifiedName> = AppPrismaClient[`${Uncapitalize<T>}Model`];
