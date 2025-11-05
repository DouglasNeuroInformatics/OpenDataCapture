import { detectSubjectType } from '@casl/ability';
import { createPrismaAbility } from '@casl/prisma';
import type { PrismaQuery } from '@casl/prisma';
import { createAccessibleByFactory } from '@casl/prisma/runtime';
import type { AppSubject, Prisma } from '@prisma/client';

import type { PrismaModelWhereInputMap } from '@/core/prisma';

import type { AppAbilities, AppAbility, AppAction, Permission } from './auth.types';

const accessibleBy = createAccessibleByFactory<PrismaModelWhereInputMap, PrismaQuery>();

export function detectAppSubject(obj: { [key: string]: any }) {
  if (typeof obj.__modelName === 'string') {
    return obj.__modelName as AppSubject;
  }
  return detectSubjectType(obj) as AppSubject;
}

export function createAppAbility(permissions: Permission[]): AppAbility {
  return createPrismaAbility<AppAbilities>(permissions, {
    detectSubjectType: detectAppSubject
  });
}

export function accessibleQuery<T extends Prisma.ModelName>(
  ability: AppAbility | undefined,
  action: AppAction,
  modelName: T
): NonNullable<PrismaModelWhereInputMap[T]> {
  if (!ability) {
    return {};
  }
  return accessibleBy(ability, action)[modelName]!;
}
